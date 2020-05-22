Occasion.Modules.push(function (library) {
  library.Product = class Product extends library.Base {
    constructCalendar(month, options = {}) {
      return Occasion.__constructCalendar(month, {
        monthlyTimeSlotDaysBatchSize: this.monthlyTimeSlotDaysBatchSize,
        monthlyTimeSlotPreloadSize: this.monthlyTimeSlotPreloadSize,
        relation: this.timeSlots(),
        timeZone: this.merchant().timeZone,
        ...options
      })
    }
  }

  library.Product.className = 'Product'
  library.Product.queryName = 'products'

  library.Product.belongsTo('merchant')
  library.Product.belongsTo('venue')

  library.Product.hasMany('labels')
  library.Product.hasMany('orders')
  library.Product.hasMany('questions')
  library.Product.hasMany('redeemables')
  library.Product.hasMany('timeSlots')

  library.Product.hasOne('firstTimeSlot', { className: 'TimeSlot' })
  library.Product.hasOne('lastTimeSlot', { className: 'TimeSlot' })
  library.Product.hasOne('firstFilteredTimeSlot', { className: 'TimeSlot' })

  library.Product.afterRequest(function () {
    this.attendeeQuestions = ActiveResource.Collection.build(this.attendeeQuestions).map((q) => {
      return s.camelize(q, true)
    })

    if (this.firstTimeSlotStartsAt) {
      if (this.merchant()) {
        this.firstTimeSlotStartsAt = moment.tz(this.firstTimeSlotStartsAt, this.merchant().timeZone)
      } else {
        throw 'Product has timeslots - but merchant.timeZone is not available; include merchant in response.'
      }
    }
  })
})
