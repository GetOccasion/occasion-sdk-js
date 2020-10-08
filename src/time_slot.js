Occasion.Modules.push(function (library) {
  library.TimeSlot = class TimeSlot extends library.Base {
    static constructCalendar = function () {
      let month, options
      if (moment.isMoment(arguments[0])) {
        month = arguments[0]
        options = arguments[1] || {}
      } else {
        options = arguments[0] || {}
      }

      return Occasion.__constructCalendar(month, {
        monthlyTimeSlotDaysBatchSize: 7,
        monthlyTimeSlotPreloadSize: 4,
        relation: this,
        ...options
      })
    }

    toString(format) {
      var output

      if (this.showTimeSlotDuration) {
        var durationTimeSlot = this.endsAt
        var durationFormat

        if (durationTimeSlot.isSame(this.startsAt, 'day')) {
          durationFormat = 'LT'
        } else {
          durationFormat = 'LLLL'
        }

        output = this.startsAt.format(format)
        output += ' - '
        output += durationTimeSlot.format(durationFormat)
      } else {
        output = this.startsAt.format(format)
      }

      return output
    }

    toDateString() {
      return this.startsAt.format('ddd ll')
    }
  }

  library.TimeSlot.className = 'TimeSlot'
  library.TimeSlot.queryName = 'time_slots'

  library.TimeSlot.belongsTo('order')
  library.TimeSlot.belongsTo('product')
  library.TimeSlot.belongsTo('venue')

  library.TimeSlot.afterRequest(function () {
    this.startsAt = moment.tz(this.startsAt, this.timeZone)
    this.duration = moment.duration(this.duration, 'minutes')
    this.endsAt = moment.tz(this.startsAt.clone().add(this.duration), this.timeZone)
  })
})
