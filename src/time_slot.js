Occasion.Modules.push(function(library) {
  library.TimeSlot = class TimeSlot extends library.Base {
    static constructCalendar = function() {
      let month, options;
      if(moment.isMoment(arguments[0])) {
        month = arguments[0];
        options = arguments[1] || {};
      } else {
        options = arguments[0] || {};
      }

      return Occasion.__constructCalendar(
        month,
        {
          monthlyTimeSlotDaysBatchSize: 7,
          monthlyTimeSlotPreloadSize: 4,
          relation: this,
          ...options
        }
      );
    };

    toString(format) {
      var output;

      if(this.product().showTimeSlotDuration) {
        var durationTimeSlot = this.startsAt.clone().add(this.duration);
        var durationFormat;

        if(durationTimeSlot.isSame(this.startsAt, 'day')) {
          durationFormat = 'LT';
        } else {
          durationFormat = 'LLLL';
        }

        output = this.startsAt.format(format);
        output += ' - ';
        output += durationTimeSlot.format(durationFormat);
      } else {
        output = this.startsAt.format(format);
      }

      return output;
    }
  };

  library.TimeSlot.className = 'TimeSlot';
  library.TimeSlot.queryName = 'time_slots';

  library.TimeSlot.belongsTo('order');
  library.TimeSlot.belongsTo('product');
  library.TimeSlot.belongsTo('venue');

  library.TimeSlot.afterRequest(function() {
    if(this.product().merchant()) {
      this.startsAt = moment.tz(this.startsAt, this.product().merchant().timeZone);
    } else {
      throw 'Must use includes({ product: \'merchant\' }) in timeSlot request';
    }

    this.duration = moment.duration(this.duration, 'minutes');
  });
});
