Occasion.Modules.push(function(library) {
  library.Product = class Product extends library.Base {
    constructCalendar(month) {
      return this.__constructCalendar(month);
    }

    // @todo Remove includes({ product: 'merchant' }) when AR supports owner assignment to has_many children
    //   in non-load queries
    __constructCalendar(month, preload, prevPagePromise) {
      var timeZone = this.merchant().timeZone;

      var today = moment.tz(timeZone);
      var lowerRange;
      if(month) {
        lowerRange = month.isSame(today, 'month') ? today : month.tz(timeZone).startOf('month');
      } else {
        lowerRange = today;
      }
      var upperRange = lowerRange.clone().endOf('month');

      var numRequests = Math.ceil(upperRange.diff(lowerRange, 'days') / this.monthlyTimeSlotDaysBatchSize);
      if(numRequests < 1) numRequests = 1;

      var i = 0;
      var requests = [];

      var lower = lowerRange.clone();
      var upper = lowerRange.clone().add(this.monthlyTimeSlotDaysBatchSize, 'days');
      while(i < numRequests) {
        if(i + 1 == numRequests) upper = upperRange.clone();

        requests.push(
          this.timeSlots()
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

        lower.add(this.monthlyTimeSlotDaysBatchSize, 'days');
        upper.add(this.monthlyTimeSlotDaysBatchSize, 'days');
        i++;
      }

      var product = this;
      if(_.isUndefined(product.__currentCalendarPage)) product.__currentCalendarPage = 0;
      if(_.isUndefined(product.__preloadedCalendarPages)) product.__preloadedCalendarPages = 0;

      product.__preloadingCalendar = true;

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
            this.nextPromise = product.__constructCalendar(
              moment(upperRange).add(1, 'days').startOf('month'),
              preloadCount,
              currentPromise
            );
          }

          if(_.isUndefined(preloadCount)) {
            product.__currentCalendarPage += 1;

            if(!product.__preloadingCalendar &&
              product.__preloadedCalendarPages <= product.__currentCalendarPage + product.monthlyTimeSlotPreloadSize / 2) {
              product.__lastPreloadedCalendarPage.nextPage(product.monthlyTimeSlotPreloadSize);
            }
          }

          return this.nextPromise;
        };

        if(month && !month.isSame(today, 'month')) {
          response.hasPrevPage = function() { return true; };

          response.prevPage = function() {
            this.prevPromise = this.prevPromise || prevPagePromise ||
              product.__constructCalendar(moment(lowerRange).subtract(1, 'months'), 0);

            product.__currentCalendarPage -= 1;

            return this.prevPromise;
          };
        }

        if(product.monthlyTimeSlotPreloadSize > 0) {
          if(_.isUndefined(preload)) {
            response.nextPage(product.monthlyTimeSlotPreloadSize - 1);
          } else if(preload > 0) {
            response.nextPage(--preload);
          } else {
            product.__preloadingCalendar = false;
          }
        }

        product.__preloadedCalendarPages += 1;
        product.__lastPreloadedCalendarPage = response;

        return response;
      });

      return currentPromise;
    }
  };

  library.Product.className = 'Product';
  library.Product.queryName = 'products';

  library.Product.belongsTo('merchant');
  library.Product.belongsTo('venue');

  library.Product.hasMany('orders');
  library.Product.hasMany('questions');
  library.Product.hasMany('redeemables');
  library.Product.hasMany('timeSlots');

  library.Product.afterRequest(function() {
    this.attendeeQuestions =
      ActiveResource.Collection.build(this.attendeeQuestions)
      .map((q) => { return s.camelize(q, true); });

    if(this.firstTimeSlotStartsAt) {
      if(this.merchant()) {
        this.firstTimeSlotStartsAt = moment.tz(this.firstTimeSlotStartsAt, this.merchant().timeZone);
      } else {
        throw 'Product has timeslots - but merchant.timeZone is not available; include merchant in response.';
      }
    }
  });
});
