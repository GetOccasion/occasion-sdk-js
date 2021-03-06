Occasion.Modules.push(function (library) {
  library.Order = class Order extends library.Base {
    static construct(attributes) {
      var order = this.includes('currency', {
        fulfillment: ['recipient', 'pickupDetails', 'shipmentDetails']
      }).build(attributes)

      order.sessionIdentifier =
        order.sessionIdentifier || Math.random().toString(36).substring(7) + '-' + Date.now()

      order.upcomingEventsEmails = order.upcomingEventsEmails || true

      if (order.customer() == null) {
        order.buildCustomer({
          email: null,
          firstName: null,
          lastName: null,
          zip: null,
          phone: null
        })
      }

      if (order.product().fulfills && order.fulfillment() == null) {
        order.buildFulfillment()
      }

      var promises = [
        new Promise(function (resolve) {
          resolve(order)
        })
      ]

      if (order.product() != null) {
        promises.push(order.product().questions().includes('options').perPage(500).load())

        if (!order.product().requiresTimeSlotSelection) {
          promises.push(
            order
              .product()
              .timeSlots()
              .includes({ product: 'merchant' })
              .where({ status: 'bookable' })
              .perPage(500)
              .all()
          )
        }
      }

      var _this = this
      return Promise.all(promises).then(function (args) {
        order = args[0]
        var questions = args[1]
        var timeSlots = args[2]

        if (questions != undefined) questions.inject(order, _this.__constructAnswer)
        if (timeSlots != undefined) order.timeSlots().assign(timeSlots, false)

        return order
      })
    }

    // Creates a transaction with a payment method and an amount
    //
    // @param [PaymentMethod] paymentMethod the payment method to charge
    // @param [Number] amount the amount to charge to the payment method
    // @return [Transaction] the built transaction representing the charge
    charge(paymentMethod, amount) {
      return this.transactions().build({
        amount: amount,
        paymentMethod: paymentMethod
      })
    }

    // Edits a transaction with a given payment method to have a new amount
    //
    // @param [PaymentMethod] paymentMethod the payment method to search transactions for
    // @param [Number] amount the new amount to charge to the payment method
    // @return [Transaction] the edited transaction representing the charge
    editCharge(paymentMethod, amount) {
      var transaction = this.transactions()
        .target()
        .detect(function (t) {
          return t.paymentMethod() == paymentMethod
        })

      if (transaction) {
        transaction.amount = amount
      }
    }

    // Removes a transaction for a given payment method
    //
    // @param [PaymentMethod] paymentMethod the payment method to remove the transaction for
    removeCharge(paymentMethod) {
      var transaction = this.transactions()
        .target()
        .detect(function (t) {
          return t.paymentMethod() == paymentMethod
        })

      if (transaction) {
        this.transactions().target().delete(transaction)
      }
    }

    save(callback) {
      if (this.association('fulfillment').loaded() && this.fulfillment()) {
        const fulfillment = this.fulfillment()

        if (fulfillment.fulfillmentType === 'shipment') {
          fulfillment.association('pickupDetails').reset()
        } else {
          fulfillment.association('shipmentDetails').reset()
        }

        ;['pickupDetails', 'shipmentDetails', 'recipient'].forEach((a) => {
          const association = fulfillment.association(a)
          if (
            association.loaded() &&
            association.target &&
            !association.target.changedFields().empty()
          ) {
            fulfillment.state = 'initialized'
          }
        })
      }

      return super.save(callback)
    }

    // @private

    // Called by Order.construct, which injects order
    // @note Must return order
    //
    // @param [Occsn.Order] order the order that wants an answer to the question
    // @param [Occsn.Question] question the question to construct an answer for
    static __constructAnswer(order, question) {
      if (question.category != 'static') {
        let answer = order.answers().build({
          question: question
        })

        switch (question.formControl) {
          case 'drop_down':
          case 'option_list':
            answer.assignOption(
              question
                .options()
                .target()
                .detect((o) => {
                  return o.default
                })
            )
            break
          case 'spin_button':
            answer.value = question.min
            break
        }
      }

      return order
    }
  }

  library.Order.className = 'Order'
  library.Order.queryName = 'orders'

  library.Order.attributes('sessionIdentifier', 'status', 'upcomingEventsEmails', 'referrerToken')

  library.Order.attributes(
    'buyerBookingFee',
    'buyerDueTodayAfterGiftCards',
    'buyerDueToday',
    'buyerTotalWithoutGiftCards',
    'couponAmount',
    'dropInsDiscount',
    'fulfillmentFee',
    'giftCardAmount',
    'outstandingBalance',
    'paymentDueOnEvent',
    'price',
    'quantity',
    'serviceFee',
    'subtotal',
    'tax',
    'taxPercentage',
    'totalDiscountsGiftCards',
    'totalTaxesFees',
    'total',
    'totalDiscount',
    { readOnly: true }
  )

  library.Order.belongsTo('coupon')
  library.Order.belongsTo('currency')
  library.Order.belongsTo('customer', { autosave: true, inverseOf: 'orders' })
  library.Order.belongsTo('merchant')
  library.Order.belongsTo('product')

  library.Order.hasOne('fulfillment', { autosave: true, inverseOf: 'order' })

  library.Order.hasMany('answers', { autosave: true, inverseOf: 'order' })
  library.Order.hasMany('attendees', { autosave: true, inverseOf: 'order' })
  library.Order.hasMany('timeSlots')
  library.Order.hasMany('transactions', { autosave: true, inverseOf: 'order' })

  library.Order.afterRequest(function () {
    if (this.product() && !this.product().attendeeQuestions.empty()) {
      var diff = this.quantity - this.attendees().size()

      if (diff != 0) {
        for (var i = 0; i < Math.abs(diff); i++) {
          if (diff > 0) {
            this.attendees().build()
          } else {
            this.attendees().target().pop()
          }
        }
      }
    }

    // Wrap these in Decimal
    ActiveResource.Collection.build([
      'buyerBookingFee',
      'buyerDueToday',
      'buyerDueTodayAfterGiftCards',
      'buyerTotalWithoutGiftCards',
      'couponAmount',
      'dropInsDiscount',
      'fulfillmentFee',
      'giftCardAmount',
      'outstandingBalance',
      'paymentDueOnEvent',
      'price',
      'quantity',
      'serviceFee',
      'subtotal',
      'tax',
      'taxPercentage',
      'total',
      'totalDiscount',
      'totalDiscountsGiftCards',
      'totalTaxesFees'
    ])
      .select((attr) => this[attr])
      .each((attr) => {
        this[attr] = new Decimal(this[attr])
      })

    if (this.outstandingBalance && !this.outstandingBalance.isZero()) {
      var giftCardTransactions = this.transactions()
        .target()
        .select((t) => t.paymentMethod() && t.paymentMethod().isA(library.GiftCard))
      var remainingBalanceTransaction = this.transactions()
        .target()
        .detect((t) => !(t.paymentMethod() && t.paymentMethod().isA(library.GiftCard)))

      if (this.outstandingBalance.isPositive()) {
        if (!giftCardTransactions.empty()) {
          giftCardTransactions.each((t) => {
            if (this.outstandingBalance.isZero()) return

            let amount = new Decimal(t.amount)
            let giftCardValue = new Decimal(t.paymentMethod().value)
            let remainingGiftCardBalance = giftCardValue.minus(amount)

            if (remainingGiftCardBalance.isZero()) return

            if (remainingGiftCardBalance.greaterThanOrEqualTo(this.outstandingBalance)) {
              amount = amount.plus(this.outstandingBalance)
              this.outstandingBalance = new Decimal(0)
            } else {
              amount = remainingGiftCardBalance
              this.outstandingBalance = this.outstandingBalance.minus(remainingGiftCardBalance)
            }

            t.amount = amount.toString()

            this.transactions().target().delete(t)
            t.__createClone({ cloner: this })
          })
        }
      } else {
        if (!giftCardTransactions.empty()) {
          ActiveResource.Collection.build(giftCardTransactions.toArray().reverse()).each((t) => {
            if (this.outstandingBalance.isZero()) return

            let amount = new Decimal(t.amount)

            if (amount.greaterThan(this.outstandingBalance.abs())) {
              amount = amount.plus(this.outstandingBalance)
              this.outstandingBalance = new Decimal(0)
            } else {
              this.outstandingBalance = this.outstandingBalance.plus(amount)

              this.removeCharge(t.paymentMethod())
              return
            }

            t.amount = amount.toString()
            this.transactions().target().delete(t)
            t.__createClone({ cloner: this })
          })
        }
      }

      if (!giftCardTransactions.empty()) {
        this.giftCardAmount = this.transactions()
          .target()
          .select((t) => t.paymentMethod() && t.paymentMethod().isA(library.GiftCard))
          .inject(new Decimal(0), (total, transaction) => total.plus(transaction.amount))
      }

      if (remainingBalanceTransaction) {
        remainingBalanceTransaction.amount = this.outstandingBalance.toString()

        this.transactions().target().delete(remainingBalanceTransaction)
        remainingBalanceTransaction.__createClone({ cloner: this })
      }
    }
  })

  const __save = library.Order.prototype.save
})
