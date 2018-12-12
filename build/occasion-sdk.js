ActiveResource.Interfaces.JsonApi.contentType = 'application/json';

class Occasion {
  static baseUrl = 'https://occ.sn/api/v1';

  static Client(options = {}) {
    var url = options.baseUrl || Occasion.baseUrl;
    var token = options.token;
    var immutable = options.immutable || false;

    if(!_.isString(token)) {
      throw 'Token must be of type string';
    }

    var encodedToken = window.btoa(unescape(encodeURIComponent(token + ':')));

    var libraryOptions = {
      headers: {
        Authorization: "Basic " + encodedToken
      },
      immutable,
      strictAttributes: true
    };

    var resourceLibrary =
      ActiveResource.createResourceLibrary(url, libraryOptions);

    Occasion.Modules.each(function(initializeModule) { initializeModule(resourceLibrary) });

    return resourceLibrary;
  }
}

Occasion.Modules = ActiveResource.prototype.Collection.build();
Occasion.Modules.push(function(library) {
  library.Answer = class Answer extends library.Base {
    valid() {
      switch(this.question().formControl) {
        case 'checkbox':
        case 'waiver':
          return !(this.question().required || this.question().formControl == 'waiver') ||
            (this.value == 'YES' || (this.value != 'NO' && this.value));
        default:
          return !this.question().required ||
            ((this.question().optionable && this.option()) ||
            (!this.question().optionable && this.value && this.value != ''));
      }
    }
  };

  library.Answer.className = 'Answer';
  library.Answer.queryName = 'answers';

  library.Answer.attributes('value');

  library.Answer.belongsTo('question');
  library.Answer.belongsTo('option');
  library.Answer.belongsTo('order', { inverseOf: 'answers' });
});

Occasion.Modules.push(function(library) {
  library.Attendee = class Attendee extends library.Base {
    complete() {
      return !this.order().product().attendeeQuestions.detect((question) => {
        return !this[question] || this[question].length == 0;
      });
    }
  };

  library.Attendee.className = 'Attendee';
  library.Attendee.queryName = 'attendees';

  library.Attendee.attributes(
    'address',
    'age',
    'city',
    'country',
    'email',
    'firstName',
    'gender',
    'lastName',
    'phone',
    'state',
    'zip'
  );

  library.Attendee.belongsTo('order', { inverseOf: 'attendees' });
});

Occasion.Modules.push(function(library) {
  library.Coupon = class Coupon extends library.Base {};

  library.Coupon.className = 'Coupon';
  library.Coupon.queryName = 'coupons';

  library.Coupon.belongsTo('merchant');
  library.Coupon.hasMany('orders');
});
Occasion.Modules.push(function(library) {
  library.Currency = class Currency extends library.Base {};

  library.Currency.className = 'Currency';
  library.Currency.queryName = 'currencies';

  library.Currency.hasMany('merchants');
  library.Currency.hasMany('orders');
});
Occasion.Modules.push(function(library) {
  library.Customer = class Customer extends library.Base {
    ahoyEmailChanged() {
      /* TODO: Align customer data with Ahoy using +this+ */
    }

    complete() {
      return this.email && this.firstName && this.lastName &&
        this.email.length > 0 && this.firstName.length > 0 && this.lastName.length > 0;
    }
  };

  library.Customer.className = 'Customer';
  library.Customer.queryName = 'customers';

  library.Customer.attributes('email', 'firstName', 'lastName', 'zip');

  library.Customer.hasMany('orders', { inverseOf: 'customer' });

  library.Customer.afterBuild(function() {
    var lastEmail = null;
    var watchEmail = _.bind(function() {
      if(lastEmail != this.email) {
        _.bind(this.ahoyEmailChanged, this)();
        lastEmail = this.email;
      }

      setTimeout(watchEmail, 500);
    }, this);

    setTimeout(watchEmail, 500);
  });
});

Occasion.Modules.push(function(library) {
  library.Merchant = class Merchant extends library.Base {};

  library.Merchant.className = 'Merchant';
  library.Merchant.queryName = 'merchants';

  library.Merchant.belongsTo('currency');
  library.Merchant.hasMany('products');
  library.Merchant.hasMany('venues');
});
Occasion.Modules.push(function(library) {
  library.Option = class Option extends library.Base {};

  library.Option.className = 'Option';
  library.Option.queryName = 'options';

  library.Option.belongsTo('answer');
  library.Option.belongsTo('question');
});
Occasion.Modules.push(function(library) {
  library.Order = class Order extends library.Base {
    static construct(attributes) {
      var order = this.build(attributes);

      order.sessionIdentifier = order.sessionIdentifier ||
        Math.random().toString(36).substring(7) + '-' + Date.now();

      if(order.customer() == null) {
        order.buildCustomer({
          email: null,
          firstName: null,
          lastName: null,
          zip: null
        });
      }

      var promises = [new Promise(function(resolve) {
        resolve(order);
      })];

      if(order.product() != null) {
        promises.push(order.product().questions().includes('options').perPage(500).load());

        if(!order.product().requiresTimeSlotSelection) {
          promises.push(
            order.product().timeSlots()
            .includes({ product: 'merchant' })
            .where({ status: 'bookable' })
            .perPage(500).all()
          );
        }
      }

      var _this = this;
      return Promise.all(promises)
      .then(function(args) {
        order = args[0];
        var questions = args[1];
        var timeSlots = args[2];

        if(questions != undefined) questions.inject(order, _this.__constructAnswer);
        if(timeSlots != undefined) order.timeSlots().assign(timeSlots, false);

        return order;
      });
    }

    // POSTs the order to `/orders/price`, which calculates price related fields and adds them to the order
    // @return [Promise] a promise for the order with price-related fields
    calculatePrice() {
      return this.interface().post(this.klass().links()['related'] + 'price', this);
    }

    // POSTs the order to `/orders/information`, which calculates price + quantity related fields and adds them to the
    //   order
    // @return [Promise] a promise for the order with price & quantity related fields
    retrieveInformation() {
      return this.interface().post(this.klass().links()['related'] + 'information', this);
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
      });
    }

    // Edits a transaction with a given payment method to have a new amount
    //
    // @param [PaymentMethod] paymentMethod the payment method to search transactions for
    // @param [Number] amount the new amount to charge to the payment method
    // @return [Transaction] the edited transaction representing the charge
    editCharge(paymentMethod, amount) {
      var transaction = this.transactions().target().detect(function(t) { return t.paymentMethod() == paymentMethod; });

      if(transaction) {
        transaction.amount = amount;
      }
    }

    // Removes a transaction for a given payment method
    //
    // @param [PaymentMethod] paymentMethod the payment method to remove the transaction for
    removeCharge(paymentMethod) {
      var transaction = this.transactions().target().detect(function(t) { return t.paymentMethod() == paymentMethod; });

      if(transaction) {
        this.transactions().target().delete(transaction);
      }
    }
    
    // @private

    // Called by Order.construct, which injects order
    // @note Must return order
    //
    // @param [Occsn.Order] order the order that wants an answer to the question
    // @param [Occsn.Question] question the question to construct an answer for
    static __constructAnswer(order, question) {
      if(question.category != 'static') {
        let answer = order.answers().build({
          question: question
        });

        switch(question.formControl) {
          case 'drop_down':
          case 'option_list':
            answer.assignOption(question.options().target().detect((o) => { return o.default }));
            break;
          case 'spin_button':
            answer.value = question.min;
            break;
        }
      }
      
      return order;
    }
  };

  library.Order.className = 'Order';
  library.Order.queryName = 'orders';

  library.Order.attributes(
    'sessionIdentifier',
    'status'
  );

  library.Order.attributes(
    'couponAmount',
    'giftCardAmount',
    'outstandingBalance',
    'price',
    'quantity',
    'subtotal',
    'tax',
    'taxPercentage',
    'total',
    { readOnly: true }
  );

  library.Order.belongsTo('coupon');
  library.Order.belongsTo('currency');
  library.Order.belongsTo('customer', { autosave: true, inverseOf: 'orders' });
  library.Order.belongsTo('merchant');
  library.Order.belongsTo('product');

  library.Order.hasMany('answers', { autosave: true, inverseOf: 'order' });
  library.Order.hasMany('attendees', { autosave: true, inverseOf: 'order' });
  library.Order.hasMany('timeSlots');
  library.Order.hasMany('transactions', { autosave: true, inverseOf: 'order' });

  library.Order.afterRequest(function() {
    if(this.product() && !this.product().attendeeQuestions.empty()) {
      var diff = this.quantity - this.attendees().size();

      if(diff != 0) {
        for(var i = 0; i < Math.abs(diff); i++) {
          if(diff > 0) {
            this.attendees().build();
          } else {
            this.attendees().target().pop();
          }
        }
      }
    }

    ActiveResource.Collection.build([
      'subtotal',
      'couponAmount',
      'tax',
      'giftCardAmount',
      'price',
      'total',
      'outstandingBalance'
    ])
    .select((attr) => this[attr])
    .each((attr) => {
      this[attr] = new Decimal(this[attr]);
    });

    if(this.outstandingBalance && !this.outstandingBalance.isZero()) {
      var giftCardTransactions = this.transactions().target().select((t) => t.paymentMethod() && t.paymentMethod().isA(library.GiftCard));
      var remainingBalanceTransaction = this.transactions().target().detect((t) => !(t.paymentMethod() && t.paymentMethod().isA(library.GiftCard)));

      if(this.outstandingBalance.isPositive()) {
        if(!giftCardTransactions.empty()) {
          giftCardTransactions
          .each((t) => {
            if(this.outstandingBalance.isZero()) return;

            let amount = new Decimal(t.amount);
            let giftCardValue = new Decimal(t.paymentMethod().value);
            let remainingGiftCardBalance = giftCardValue.minus(amount);

            if(remainingGiftCardBalance.isZero()) return;

            if(remainingGiftCardBalance.greaterThanOrEqualTo(this.outstandingBalance)) {
              amount = amount.plus(this.outstandingBalance);
              this.outstandingBalance = new Decimal(0);
            } else {
              amount = remainingGiftCardBalance;
              this.outstandingBalance = this.outstandingBalance.minus(remainingGiftCardBalance);
            }

            t.amount = amount.toString();

            this.transactions().target().delete(t);
            t.__createClone({ cloner: this });
          });
        }
      } else {
        if(!giftCardTransactions.empty()) {
          ActiveResource.Collection.build(giftCardTransactions.toArray().reverse())
          .each((t) => {
            if(this.outstandingBalance.isZero()) return;

            let amount = new Decimal(t.amount);

            if(amount.greaterThan(this.outstandingBalance.abs())) {
              amount = amount.plus(this.outstandingBalance);
              this.outstandingBalance = new Decimal(0);
            } else {
              this.outstandingBalance = this.outstandingBalance.plus(amount);

              this.removeCharge(t.paymentMethod());
              return;
            }

            t.amount = amount.toString();
            this.transactions().target().delete(t);
            t.__createClone({ cloner: this });
          });
        }
      }

      if(!giftCardTransactions.empty()) {
        this.giftCardAmount = this.transactions().target()
          .select((t) => t.paymentMethod() && t.paymentMethod().isA(library.GiftCard))
          .inject(
            new Decimal(0),
            (total, transaction) => total.plus(transaction.amount)
          );
      }

      if(remainingBalanceTransaction) {
        remainingBalanceTransaction.amount = this.outstandingBalance.toString();

        this.transactions().target().delete(remainingBalanceTransaction);
        remainingBalanceTransaction.__createClone({ cloner: this });
      }
    }
  });
});

Occasion.Modules.push(function(library) {
  library.PaymentMethod = class PaymentMethod extends library.Base {};

  library.PaymentMethod.className = 'PaymentMethod';
  library.PaymentMethod.queryName = 'payment_methods';

  library.PaymentMethod.hasMany('transactions', { as: 'paymentMethod' });
});
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

Occasion.Modules.push(function(library) {
  library.Question = class Question extends library.Base {};

  library.Question.className = 'Question';
  library.Question.queryName = 'questions';

  library.Question.belongsTo('product');
  library.Question.hasMany('answers');
  library.Question.hasMany('options');
});
Occasion.Modules.push(function(library) {
  // TODO: Remove ability to directly query redeemables
  library.Redeemable = class Redeemable extends library.Base {};

  library.Redeemable.className = 'Redeemable';
  library.Redeemable.queryName = 'redeemables';

  library.Redeemable.belongsTo('product');
});
Occasion.Modules.push(function(library) {
  library.State = class State extends library.Base {};

  library.State.className = 'State';
  library.State.queryName = 'states';
});

Occasion.Modules.push(function(library) {
  library.TimeSlot = class TimeSlot extends library.Base {
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

Occasion.Modules.push(function(library) {
  library.Transaction = class Transaction extends library.Base {};

  library.Transaction.className = 'Transaction';
  library.Transaction.queryName = 'transactions';

  library.Transaction.attributes('amount');

  library.Transaction.belongsTo('order', { inverseOf: 'transactions' });
  library.Transaction.belongsTo('paymentMethod', { polymorphic: true });
});

Occasion.Modules.push(function(library) {
  library.Venue = class Venue extends library.Base {};

  library.Venue.className = 'Venue';
  library.Venue.queryName = 'venues';

  library.Venue.belongsTo('merchant');
  library.Venue.belongsTo('state');

  library.Venue.hasMany('products');
});

Occasion.Modules.push(function(library) {
  library.CreditCard = class CreditCard extends library.PaymentMethod {};

  library.CreditCard.className = 'CreditCard';
  library.CreditCard.queryName = 'credit_cards';

  library.CreditCard.hasMany('transactions', { as: 'paymentMethod' });
});
Occasion.Modules.push(function(library) {
  library.GiftCard = class GiftCard extends library.PaymentMethod {};

  library.GiftCard.className = 'GiftCard';
  library.GiftCard.queryName = 'gift_cards';

  library.GiftCard.belongsTo('customer');
  library.GiftCard.hasMany('transactions', { as: 'paymentMethod' });
});