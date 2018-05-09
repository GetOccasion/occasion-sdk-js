Occasion.Modules.push(function(library) {
  library.Product = class Product extends library.Base {
    constructCalendar(month) {
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
        if(i + 1 == numRequests) upper = upperRange;

        requests.push(this.timeSlots().where({
          startsAt: {
            ge: lower.toDate(),
            le: upper.toDate()
          },
          status: 'bookable'
        }).all());

        lower.add(this.monthlyTimeSlotDaysBatchSize, 'days');
        upper.add(this.monthlyTimeSlotDaysBatchSize, 'days');
        i++;
      }

      return Promise.all(requests)
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

        return response;
      });
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
