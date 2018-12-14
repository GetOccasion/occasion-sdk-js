// @todo Remove includes({ product: 'merchant' }) when AR supports owner assignment to has_many children
//   in non-load queries
Occasion.__constructCalendar = function __constructCalendar(month, {
  calendar,
  monthlyTimeSlotDaysBatchSize,
  monthlyTimeSlotPreloadSize,
  preload,
  prevPagePromise,
  relation,
  timeZone
} = {}) {
  var today = moment.tz(timeZone);
  var lowerRange;
  if(month) {
    lowerRange = month.isSame(today, 'month') ? today : month.tz(timeZone).startOf('month');
  } else {
    lowerRange = today;
  }
  var upperRange = lowerRange.clone().endOf('month');

  var numRequests = Math.ceil(upperRange.diff(lowerRange, 'days') / monthlyTimeSlotDaysBatchSize);
  if(numRequests < 1) numRequests = 1;

  var i = 0;
  var requests = [];

  var lower = lowerRange.clone();
  var upper = lowerRange.clone().add(monthlyTimeSlotDaysBatchSize, 'days');
  while(i < numRequests) {
    if(i + 1 == numRequests) upper = upperRange.clone();

    requests.push(
      relation
      .includes({
        product: 'merchant'
      })
      .where({
        startsAt: {
          ge: lower.toDate(),
          le: upper.toDate()
        },
        status: 'bookable'
      }).all()
    );

    lower.add(monthlyTimeSlotDaysBatchSize, 'days');
    upper.add(monthlyTimeSlotDaysBatchSize, 'days');
    i++;
  }

  calendar = calendar || {};
  if(_.isUndefined(calendar.__currentPage)) calendar.__currentPage = 0;
  if(_.isUndefined(calendar.__preloadedPages)) calendar.__preloadedPages = 0;

  calendar.__preloading = true;

  var currentPromise = Promise.all(requests)
  .then(function(timeSlotsArray) {
    var allTimeSlots = ActiveResource.Collection
    .build(timeSlotsArray)
    .map(function(ts) { return ts.toArray() })
    .flatten();

    let startDate = moment(lowerRange).startOf('month');
    let endDate = moment(lowerRange).endOf('month');

    var response = ActiveResource.CollectionResponse.build();

    let day = startDate;
    while(day.isSameOrBefore(endDate)) {
      response.push({
        day,
        timeSlots: allTimeSlots.select((timeSlot) => { return timeSlot.startsAt.isSame(day, 'day'); })
      });

      day = day.clone().add(1, 'days');
    }

    response.hasNextPage = function() { return true; };

    response.nextPage = function(preloadCount) {
      if(!this.nextPromise) {
        this.nextPromise = Occasion.__constructCalendar(
          moment(upperRange).add(1, 'days').startOf('month'),
          {
            calendar,
            monthlyTimeSlotDaysBatchSize,
            monthlyTimeSlotPreloadSize,
            preload: preloadCount,
            prevPagePromise: currentPromise,
            relation,
            timeZone
          },
        );
      }

      if(_.isUndefined(preloadCount)) {
        calendar.__currentPage += 1;

        if(!calendar.__preloading &&
          calendar.__preloadedPages <= calendar.__currentPage + monthlyTimeSlotPreloadSize / 2) {
          calendar.__lastPreloadedPage.nextPage(monthlyTimeSlotPreloadSize);
        }
      }

      return this.nextPromise;
    };

    if(month && !month.isSame(today, 'month')) {
      response.hasPrevPage = function() { return true; };

      response.prevPage = function() {
        this.prevPromise = this.prevPromise || prevPagePromise ||
          Occasion.__constructCalendar(
            moment(lowerRange).subtract(1, 'months'),
            {
              calendar,
              monthlyTimeSlotDaysBatchSize,
              monthlyTimeSlotPreloadSize,
              preload: 0,
              relation,
              timeZone
            }
          );

        calendar.__currentPage -= 1;

        return this.prevPromise;
      };
    }

    if(monthlyTimeSlotPreloadSize > 0) {
      if(_.isUndefined(preload)) {
        response.nextPage(monthlyTimeSlotPreloadSize - 1);
      } else if(preload > 0) {
        response.nextPage(--preload);
      } else {
        calendar.__preloading = false;
      }
    }

    calendar.__preloadedPages += 1;
    calendar.__lastPreloadedPage = response;

    return response;
  });

  return currentPromise;
};
