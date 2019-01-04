(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["active-resource","axios","decimal.js-light","moment","underscore","underscore.string","moment-timezone-with-data-2010-2020"], function (a0,b1,c2,d3,e4,f5,g6) {
      return (root['Occasion'] = factory(a0,b1,c2,d3,e4,f5,g6));
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("active-resource"),require("axios"),require("decimal.js-light"),require("moment"),require("underscore"),require("underscore.string"),require("moment-timezone-with-data-2010-2020"));
  } else {
    root['Occasion'] = factory(root["active-resource"],root["axios"],root["decimal.js-light"],root["moment"],root["underscore"],root["underscore.string"],root["moment-timezone-with-data-2010-2020"]);
  }
}(this, function (ActiveResource, axios, Decimal, moment, _, s) {

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

ActiveResource.Interfaces.JsonApi.contentType = 'application/json';

var Occasion = function () {
  function Occasion() {
    _classCallCheck(this, Occasion);
  }

  _createClass(Occasion, null, [{
    key: 'Client',
    value: function Client() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var url = options.baseUrl || Occasion.baseUrl;
      var token = options.token;
      var immutable = options.immutable || false;

      if (!_.isString(token)) {
        throw 'Token must be of type string';
      }

      var encodedToken = window.btoa(unescape(encodeURIComponent(token + ':')));

      var libraryOptions = {
        headers: {
          Authorization: "Basic " + encodedToken
        },
        immutable: immutable,
        strictAttributes: true
      };

      var resourceLibrary = ActiveResource.createResourceLibrary(url, libraryOptions);

      Occasion.Modules.each(function (initializeModule) {
        initializeModule(resourceLibrary);
      });

      return resourceLibrary;
    }
  }]);

  return Occasion;
}();

Occasion.baseUrl = 'https://occ.sn/api/v1';


Occasion.Modules = ActiveResource.prototype.Collection.build();
// @todo Remove includes({ product: 'merchant' }) when AR supports owner assignment to has_many children
//   in non-load queries
Occasion.__constructCalendar = function __constructCalendar(month) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      calendar = _ref.calendar,
      monthlyTimeSlotDaysBatchSize = _ref.monthlyTimeSlotDaysBatchSize,
      monthlyTimeSlotPreloadSize = _ref.monthlyTimeSlotPreloadSize,
      preload = _ref.preload,
      prevPagePromise = _ref.prevPagePromise,
      relation = _ref.relation,
      status = _ref.status,
      timeZone = _ref.timeZone;

  var today = moment.tz(timeZone);
  status = status || 'bookable';

  var lowerRange;
  if (month) {
    lowerRange = month.tz(timeZone);
  } else {
    lowerRange = today;
  }
  lowerRange = lowerRange.startOf('month');
  var upperRange = lowerRange.clone().endOf('month');

  var numRequests = Math.ceil(upperRange.diff(lowerRange, 'days') / monthlyTimeSlotDaysBatchSize);
  if (numRequests < 1) numRequests = 1;

  var i = 0;
  var requests = [];

  var lower = lowerRange.clone();
  var upper = lowerRange.clone().add(monthlyTimeSlotDaysBatchSize, 'days');
  while (i < numRequests) {
    if (i + 1 == numRequests) upper = upperRange.clone();

    requests.push(relation.includes({
      product: 'merchant'
    }).where({
      startsAt: {
        ge: lower.toDate(),
        le: upper.toDate()
      },
      status: status
    }).all());

    lower.add(monthlyTimeSlotDaysBatchSize, 'days');
    upper.add(monthlyTimeSlotDaysBatchSize, 'days');
    i++;
  }

  calendar = calendar || {};
  if (_.isUndefined(calendar.__currentPage)) calendar.__currentPage = 0;
  if (_.isUndefined(calendar.__preloadedPages)) calendar.__preloadedPages = 0;

  calendar.__preloading = true;

  var currentPromise = Promise.all(requests).then(function (timeSlotsArray) {
    var allTimeSlots = ActiveResource.Collection.build(timeSlotsArray).map(function (ts) {
      return ts.toArray();
    }).flatten();

    var startDate = moment(lowerRange).startOf('month');
    var endDate = moment(lowerRange).endOf('month');

    var response = ActiveResource.CollectionResponse.build();

    var day = startDate;
    while (day.isSameOrBefore(endDate)) {
      response.push({
        day: day,
        timeSlots: allTimeSlots.select(function (timeSlot) {
          return timeSlot.startsAt.isSame(day, 'day');
        })
      });

      day = day.clone().add(1, 'days');
    }

    response.hasNextPage = function () {
      return true;
    };

    var commonPaginationOptions = {
      calendar: calendar,
      monthlyTimeSlotDaysBatchSize: monthlyTimeSlotDaysBatchSize,
      monthlyTimeSlotPreloadSize: monthlyTimeSlotPreloadSize,
      relation: relation,
      status: status,
      timeZone: timeZone
    };

    response.nextPage = function (preloadCount) {
      if (!this.nextPromise) {
        this.nextPromise = Occasion.__constructCalendar(moment(upperRange).add(1, 'days').startOf('month'), _extends({}, commonPaginationOptions, {
          preload: preloadCount,
          prevPagePromise: currentPromise
        }));
      }

      if (_.isUndefined(preloadCount)) {
        calendar.__currentPage += 1;

        if (!calendar.__preloading && calendar.__preloadedPages <= calendar.__currentPage + monthlyTimeSlotPreloadSize / 2) {
          calendar.__lastPreloadedPage.nextPage(monthlyTimeSlotPreloadSize);
        }
      }

      return this.nextPromise;
    };

    if (status !== 'bookable' || month && !month.isSame(today, 'month')) {
      response.hasPrevPage = function () {
        return true;
      };

      response.prevPage = function () {
        this.prevPromise = this.prevPromise || prevPagePromise || Occasion.__constructCalendar(moment(lowerRange).subtract(1, 'months'), _extends({}, commonPaginationOptions, {
          preload: 0
        }));

        calendar.__currentPage -= 1;

        return this.prevPromise;
      };
    }

    if (monthlyTimeSlotPreloadSize > 0) {
      if (_.isUndefined(preload)) {
        response.nextPage(monthlyTimeSlotPreloadSize - 1);
      } else if (preload > 0) {
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

Occasion.Modules.push(function (library) {
  library.Answer = function (_library$Base) {
    _inherits(Answer, _library$Base);

    function Answer() {
      _classCallCheck(this, Answer);

      return _possibleConstructorReturn(this, (Answer.__proto__ || Object.getPrototypeOf(Answer)).apply(this, arguments));
    }

    _createClass(Answer, [{
      key: 'valid',
      value: function valid() {
        switch (this.question().formControl) {
          case 'checkbox':
          case 'waiver':
            return !(this.question().required || this.question().formControl == 'waiver') || this.value == 'YES' || this.value != 'NO' && this.value;
          default:
            return !this.question().required || this.question().optionable && this.option() || !this.question().optionable && this.value && this.value != '';
        }
      }
    }]);

    return Answer;
  }(library.Base);

  library.Answer.className = 'Answer';
  library.Answer.queryName = 'answers';

  library.Answer.attributes('value');

  library.Answer.belongsTo('question');
  library.Answer.belongsTo('option');
  library.Answer.belongsTo('order', { inverseOf: 'answers' });
});

Occasion.Modules.push(function (library) {
  library.Attendee = function (_library$Base2) {
    _inherits(Attendee, _library$Base2);

    function Attendee() {
      _classCallCheck(this, Attendee);

      return _possibleConstructorReturn(this, (Attendee.__proto__ || Object.getPrototypeOf(Attendee)).apply(this, arguments));
    }

    _createClass(Attendee, [{
      key: 'complete',
      value: function complete() {
        var _this4 = this;

        return !this.order().product().attendeeQuestions.detect(function (question) {
          return !_this4[question] || _this4[question].length == 0;
        });
      }
    }]);

    return Attendee;
  }(library.Base);

  library.Attendee.className = 'Attendee';
  library.Attendee.queryName = 'attendees';

  library.Attendee.attributes('address', 'age', 'city', 'country', 'email', 'firstName', 'gender', 'lastName', 'phone', 'state', 'zip');

  library.Attendee.belongsTo('order', { inverseOf: 'attendees' });
});

Occasion.Modules.push(function (library) {
  library.Coupon = function (_library$Base3) {
    _inherits(Coupon, _library$Base3);

    function Coupon() {
      _classCallCheck(this, Coupon);

      return _possibleConstructorReturn(this, (Coupon.__proto__ || Object.getPrototypeOf(Coupon)).apply(this, arguments));
    }

    return Coupon;
  }(library.Base);

  library.Coupon.className = 'Coupon';
  library.Coupon.queryName = 'coupons';

  library.Coupon.belongsTo('merchant');
  library.Coupon.hasMany('orders');
});
Occasion.Modules.push(function (library) {
  library.Currency = function (_library$Base4) {
    _inherits(Currency, _library$Base4);

    function Currency() {
      _classCallCheck(this, Currency);

      return _possibleConstructorReturn(this, (Currency.__proto__ || Object.getPrototypeOf(Currency)).apply(this, arguments));
    }

    return Currency;
  }(library.Base);

  library.Currency.className = 'Currency';
  library.Currency.queryName = 'currencies';

  library.Currency.hasMany('merchants');
  library.Currency.hasMany('orders');
});
Occasion.Modules.push(function (library) {
  library.Customer = function (_library$Base5) {
    _inherits(Customer, _library$Base5);

    function Customer() {
      _classCallCheck(this, Customer);

      return _possibleConstructorReturn(this, (Customer.__proto__ || Object.getPrototypeOf(Customer)).apply(this, arguments));
    }

    _createClass(Customer, [{
      key: 'ahoyEmailChanged',
      value: function ahoyEmailChanged() {
        /* TODO: Align customer data with Ahoy using +this+ */
      }
    }, {
      key: 'complete',
      value: function complete() {
        return this.email && this.firstName && this.lastName && this.email.length > 0 && this.firstName.length > 0 && this.lastName.length > 0;
      }
    }]);

    return Customer;
  }(library.Base);

  library.Customer.className = 'Customer';
  library.Customer.queryName = 'customers';

  library.Customer.attributes('email', 'firstName', 'lastName', 'zip');

  library.Customer.hasMany('orders', { inverseOf: 'customer' });

  library.Customer.afterBuild(function () {
    var lastEmail = null;
    var watchEmail = _.bind(function () {
      if (lastEmail != this.email) {
        _.bind(this.ahoyEmailChanged, this)();
        lastEmail = this.email;
      }

      setTimeout(watchEmail, 500);
    }, this);

    setTimeout(watchEmail, 500);
  });
});

Occasion.Modules.push(function (library) {
  library.Merchant = function (_library$Base6) {
    _inherits(Merchant, _library$Base6);

    function Merchant() {
      _classCallCheck(this, Merchant);

      return _possibleConstructorReturn(this, (Merchant.__proto__ || Object.getPrototypeOf(Merchant)).apply(this, arguments));
    }

    return Merchant;
  }(library.Base);

  library.Merchant.className = 'Merchant';
  library.Merchant.queryName = 'merchants';

  library.Merchant.belongsTo('currency');
  library.Merchant.hasMany('products');
  library.Merchant.hasMany('venues');
});
Occasion.Modules.push(function (library) {
  library.Option = function (_library$Base7) {
    _inherits(Option, _library$Base7);

    function Option() {
      _classCallCheck(this, Option);

      return _possibleConstructorReturn(this, (Option.__proto__ || Object.getPrototypeOf(Option)).apply(this, arguments));
    }

    return Option;
  }(library.Base);

  library.Option.className = 'Option';
  library.Option.queryName = 'options';

  library.Option.belongsTo('answer');
  library.Option.belongsTo('question');
});
Occasion.Modules.push(function (library) {
  library.Order = function (_library$Base8) {
    _inherits(Order, _library$Base8);

    function Order() {
      _classCallCheck(this, Order);

      return _possibleConstructorReturn(this, (Order.__proto__ || Object.getPrototypeOf(Order)).apply(this, arguments));
    }

    _createClass(Order, [{
      key: 'calculatePrice',


      // POSTs the order to `/orders/price`, which calculates price related fields and adds them to the order
      // @return [Promise] a promise for the order with price-related fields
      value: function calculatePrice() {
        return this.interface().post(this.klass().links()['related'] + 'price', this);
      }

      // POSTs the order to `/orders/information`, which calculates price + quantity related fields and adds them to the
      //   order
      // @return [Promise] a promise for the order with price & quantity related fields

    }, {
      key: 'retrieveInformation',
      value: function retrieveInformation() {
        return this.interface().post(this.klass().links()['related'] + 'information', this);
      }

      // Creates a transaction with a payment method and an amount
      //
      // @param [PaymentMethod] paymentMethod the payment method to charge
      // @param [Number] amount the amount to charge to the payment method
      // @return [Transaction] the built transaction representing the charge

    }, {
      key: 'charge',
      value: function charge(paymentMethod, amount) {
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

    }, {
      key: 'editCharge',
      value: function editCharge(paymentMethod, amount) {
        var transaction = this.transactions().target().detect(function (t) {
          return t.paymentMethod() == paymentMethod;
        });

        if (transaction) {
          transaction.amount = amount;
        }
      }

      // Removes a transaction for a given payment method
      //
      // @param [PaymentMethod] paymentMethod the payment method to remove the transaction for

    }, {
      key: 'removeCharge',
      value: function removeCharge(paymentMethod) {
        var transaction = this.transactions().target().detect(function (t) {
          return t.paymentMethod() == paymentMethod;
        });

        if (transaction) {
          this.transactions().target().delete(transaction);
        }
      }

      // @private

      // Called by Order.construct, which injects order
      // @note Must return order
      //
      // @param [Occsn.Order] order the order that wants an answer to the question
      // @param [Occsn.Question] question the question to construct an answer for

    }], [{
      key: 'construct',
      value: function construct(attributes) {
        var order = this.includes('currency').build(attributes);

        order.sessionIdentifier = order.sessionIdentifier || Math.random().toString(36).substring(7) + '-' + Date.now();

        if (order.customer() == null) {
          order.buildCustomer({
            email: null,
            firstName: null,
            lastName: null,
            zip: null
          });
        }

        var promises = [new Promise(function (resolve) {
          resolve(order);
        })];

        if (order.product() != null) {
          promises.push(order.product().questions().includes('options').perPage(500).load());

          if (!order.product().requiresTimeSlotSelection) {
            promises.push(order.product().timeSlots().includes({ product: 'merchant' }).where({ status: 'bookable' }).perPage(500).all());
          }
        }

        var _this = this;
        return Promise.all(promises).then(function (args) {
          order = args[0];
          var questions = args[1];
          var timeSlots = args[2];

          if (questions != undefined) questions.inject(order, _this.__constructAnswer);
          if (timeSlots != undefined) order.timeSlots().assign(timeSlots, false);

          return order;
        });
      }
    }, {
      key: '__constructAnswer',
      value: function __constructAnswer(order, question) {
        if (question.category != 'static') {
          var answer = order.answers().build({
            question: question
          });

          switch (question.formControl) {
            case 'drop_down':
            case 'option_list':
              answer.assignOption(question.options().target().detect(function (o) {
                return o.default;
              }));
              break;
            case 'spin_button':
              answer.value = question.min;
              break;
          }
        }

        return order;
      }
    }]);

    return Order;
  }(library.Base);

  library.Order.className = 'Order';
  library.Order.queryName = 'orders';

  library.Order.attributes('sessionIdentifier', 'status');

  library.Order.attributes('couponAmount', 'giftCardAmount', 'outstandingBalance', 'price', 'quantity', 'subtotal', 'tax', 'taxPercentage', 'total', { readOnly: true });

  library.Order.belongsTo('coupon');
  library.Order.belongsTo('currency');
  library.Order.belongsTo('customer', { autosave: true, inverseOf: 'orders' });
  library.Order.belongsTo('merchant');
  library.Order.belongsTo('product');

  library.Order.hasMany('answers', { autosave: true, inverseOf: 'order' });
  library.Order.hasMany('attendees', { autosave: true, inverseOf: 'order' });
  library.Order.hasMany('timeSlots');
  library.Order.hasMany('transactions', { autosave: true, inverseOf: 'order' });

  library.Order.afterRequest(function () {
    var _this11 = this;

    if (this.product() && !this.product().attendeeQuestions.empty()) {
      var diff = this.quantity - this.attendees().size();

      if (diff != 0) {
        for (var i = 0; i < Math.abs(diff); i++) {
          if (diff > 0) {
            this.attendees().build();
          } else {
            this.attendees().target().pop();
          }
        }
      }
    }

    ActiveResource.Collection.build(['subtotal', 'couponAmount', 'tax', 'giftCardAmount', 'price', 'total', 'outstandingBalance']).select(function (attr) {
      return _this11[attr];
    }).each(function (attr) {
      _this11[attr] = new Decimal(_this11[attr]);
    });

    if (this.outstandingBalance && !this.outstandingBalance.isZero()) {
      var giftCardTransactions = this.transactions().target().select(function (t) {
        return t.paymentMethod() && t.paymentMethod().isA(library.GiftCard);
      });
      var remainingBalanceTransaction = this.transactions().target().detect(function (t) {
        return !(t.paymentMethod() && t.paymentMethod().isA(library.GiftCard));
      });

      if (this.outstandingBalance.isPositive()) {
        if (!giftCardTransactions.empty()) {
          giftCardTransactions.each(function (t) {
            if (_this11.outstandingBalance.isZero()) return;

            var amount = new Decimal(t.amount);
            var giftCardValue = new Decimal(t.paymentMethod().value);
            var remainingGiftCardBalance = giftCardValue.minus(amount);

            if (remainingGiftCardBalance.isZero()) return;

            if (remainingGiftCardBalance.greaterThanOrEqualTo(_this11.outstandingBalance)) {
              amount = amount.plus(_this11.outstandingBalance);
              _this11.outstandingBalance = new Decimal(0);
            } else {
              amount = remainingGiftCardBalance;
              _this11.outstandingBalance = _this11.outstandingBalance.minus(remainingGiftCardBalance);
            }

            t.amount = amount.toString();

            _this11.transactions().target().delete(t);
            t.__createClone({ cloner: _this11 });
          });
        }
      } else {
        if (!giftCardTransactions.empty()) {
          ActiveResource.Collection.build(giftCardTransactions.toArray().reverse()).each(function (t) {
            if (_this11.outstandingBalance.isZero()) return;

            var amount = new Decimal(t.amount);

            if (amount.greaterThan(_this11.outstandingBalance.abs())) {
              amount = amount.plus(_this11.outstandingBalance);
              _this11.outstandingBalance = new Decimal(0);
            } else {
              _this11.outstandingBalance = _this11.outstandingBalance.plus(amount);

              _this11.removeCharge(t.paymentMethod());
              return;
            }

            t.amount = amount.toString();
            _this11.transactions().target().delete(t);
            t.__createClone({ cloner: _this11 });
          });
        }
      }

      if (!giftCardTransactions.empty()) {
        this.giftCardAmount = this.transactions().target().select(function (t) {
          return t.paymentMethod() && t.paymentMethod().isA(library.GiftCard);
        }).inject(new Decimal(0), function (total, transaction) {
          return total.plus(transaction.amount);
        });
      }

      if (remainingBalanceTransaction) {
        remainingBalanceTransaction.amount = this.outstandingBalance.toString();

        this.transactions().target().delete(remainingBalanceTransaction);
        remainingBalanceTransaction.__createClone({ cloner: this });
      }
    }
  });
});

Occasion.Modules.push(function (library) {
  library.PaymentMethod = function (_library$Base9) {
    _inherits(PaymentMethod, _library$Base9);

    function PaymentMethod() {
      _classCallCheck(this, PaymentMethod);

      return _possibleConstructorReturn(this, (PaymentMethod.__proto__ || Object.getPrototypeOf(PaymentMethod)).apply(this, arguments));
    }

    return PaymentMethod;
  }(library.Base);

  library.PaymentMethod.className = 'PaymentMethod';
  library.PaymentMethod.queryName = 'payment_methods';

  library.PaymentMethod.hasMany('transactions', { as: 'paymentMethod' });
});
Occasion.Modules.push(function (library) {
  library.Product = function (_library$Base10) {
    _inherits(Product, _library$Base10);

    function Product() {
      _classCallCheck(this, Product);

      return _possibleConstructorReturn(this, (Product.__proto__ || Object.getPrototypeOf(Product)).apply(this, arguments));
    }

    _createClass(Product, [{
      key: 'constructCalendar',
      value: function constructCalendar(month) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        return Occasion.__constructCalendar(month, _extends({
          monthlyTimeSlotDaysBatchSize: this.monthlyTimeSlotDaysBatchSize,
          monthlyTimeSlotPreloadSize: this.monthlyTimeSlotPreloadSize,
          relation: this.timeSlots(),
          timeZone: this.merchant().timeZone
        }, options));
      }
    }]);

    return Product;
  }(library.Base);

  library.Product.className = 'Product';
  library.Product.queryName = 'products';

  library.Product.belongsTo('merchant');
  library.Product.belongsTo('venue');

  library.Product.hasMany('orders');
  library.Product.hasMany('questions');
  library.Product.hasMany('redeemables');
  library.Product.hasMany('timeSlots');

  library.Product.afterRequest(function () {
    this.attendeeQuestions = ActiveResource.Collection.build(this.attendeeQuestions).map(function (q) {
      return s.camelize(q, true);
    });

    if (this.firstTimeSlotStartsAt) {
      if (this.merchant()) {
        this.firstTimeSlotStartsAt = moment.tz(this.firstTimeSlotStartsAt, this.merchant().timeZone);
      } else {
        throw 'Product has timeslots - but merchant.timeZone is not available; include merchant in response.';
      }
    }
  });
});

Occasion.Modules.push(function (library) {
  library.Question = function (_library$Base11) {
    _inherits(Question, _library$Base11);

    function Question() {
      _classCallCheck(this, Question);

      return _possibleConstructorReturn(this, (Question.__proto__ || Object.getPrototypeOf(Question)).apply(this, arguments));
    }

    return Question;
  }(library.Base);

  library.Question.className = 'Question';
  library.Question.queryName = 'questions';

  library.Question.belongsTo('product');
  library.Question.hasMany('answers');
  library.Question.hasMany('options');
});
Occasion.Modules.push(function (library) {
  // TODO: Remove ability to directly query redeemables
  library.Redeemable = function (_library$Base12) {
    _inherits(Redeemable, _library$Base12);

    function Redeemable() {
      _classCallCheck(this, Redeemable);

      return _possibleConstructorReturn(this, (Redeemable.__proto__ || Object.getPrototypeOf(Redeemable)).apply(this, arguments));
    }

    return Redeemable;
  }(library.Base);

  library.Redeemable.className = 'Redeemable';
  library.Redeemable.queryName = 'redeemables';

  library.Redeemable.belongsTo('product');
});
Occasion.Modules.push(function (library) {
  library.State = function (_library$Base13) {
    _inherits(State, _library$Base13);

    function State() {
      _classCallCheck(this, State);

      return _possibleConstructorReturn(this, (State.__proto__ || Object.getPrototypeOf(State)).apply(this, arguments));
    }

    return State;
  }(library.Base);

  library.State.className = 'State';
  library.State.queryName = 'states';
});

Occasion.Modules.push(function (library) {
  var _class, _temp;

  library.TimeSlot = (_temp = _class = function (_library$Base14) {
    _inherits(TimeSlot, _library$Base14);

    function TimeSlot() {
      _classCallCheck(this, TimeSlot);

      return _possibleConstructorReturn(this, (TimeSlot.__proto__ || Object.getPrototypeOf(TimeSlot)).apply(this, arguments));
    }

    _createClass(TimeSlot, [{
      key: 'toString',
      value: function toString(format) {
        var output;

        if (this.product().showTimeSlotDuration) {
          var durationTimeSlot = this.startsAt.clone().add(this.duration);
          var durationFormat;

          if (durationTimeSlot.isSame(this.startsAt, 'day')) {
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
    }]);

    return TimeSlot;
  }(library.Base), _class.constructCalendar = function () {
    var month = void 0,
        options = void 0;
    if (moment.isMoment(arguments[0])) {
      month = arguments[0];
      options = arguments[1] || {};
    } else {
      options = arguments[0] || {};
    }

    return Occasion.__constructCalendar(month, _extends({
      monthlyTimeSlotDaysBatchSize: 7,
      monthlyTimeSlotPreloadSize: 4,
      relation: this
    }, options));
  }, _temp);

  library.TimeSlot.className = 'TimeSlot';
  library.TimeSlot.queryName = 'time_slots';

  library.TimeSlot.belongsTo('order');
  library.TimeSlot.belongsTo('product');
  library.TimeSlot.belongsTo('venue');

  library.TimeSlot.afterRequest(function () {
    if (this.product().merchant()) {
      this.startsAt = moment.tz(this.startsAt, this.product().merchant().timeZone);
    } else {
      throw 'Must use includes({ product: \'merchant\' }) in timeSlot request';
    }

    this.duration = moment.duration(this.duration, 'minutes');
  });
});

Occasion.Modules.push(function (library) {
  library.Transaction = function (_library$Base15) {
    _inherits(Transaction, _library$Base15);

    function Transaction() {
      _classCallCheck(this, Transaction);

      return _possibleConstructorReturn(this, (Transaction.__proto__ || Object.getPrototypeOf(Transaction)).apply(this, arguments));
    }

    return Transaction;
  }(library.Base);

  library.Transaction.className = 'Transaction';
  library.Transaction.queryName = 'transactions';

  library.Transaction.attributes('amount');

  library.Transaction.belongsTo('order', { inverseOf: 'transactions' });
  library.Transaction.belongsTo('paymentMethod', { polymorphic: true });
});

Occasion.Modules.push(function (library) {
  library.Venue = function (_library$Base16) {
    _inherits(Venue, _library$Base16);

    function Venue() {
      _classCallCheck(this, Venue);

      return _possibleConstructorReturn(this, (Venue.__proto__ || Object.getPrototypeOf(Venue)).apply(this, arguments));
    }

    return Venue;
  }(library.Base);

  library.Venue.className = 'Venue';
  library.Venue.queryName = 'venues';

  library.Venue.belongsTo('merchant');
  library.Venue.belongsTo('state');

  library.Venue.hasMany('products');
});

Occasion.Modules.push(function (library) {
  library.CreditCard = function (_library$PaymentMetho) {
    _inherits(CreditCard, _library$PaymentMetho);

    function CreditCard() {
      _classCallCheck(this, CreditCard);

      return _possibleConstructorReturn(this, (CreditCard.__proto__ || Object.getPrototypeOf(CreditCard)).apply(this, arguments));
    }

    return CreditCard;
  }(library.PaymentMethod);

  library.CreditCard.className = 'CreditCard';
  library.CreditCard.queryName = 'credit_cards';

  library.CreditCard.hasMany('transactions', { as: 'paymentMethod' });
});
Occasion.Modules.push(function (library) {
  library.GiftCard = function (_library$PaymentMetho2) {
    _inherits(GiftCard, _library$PaymentMetho2);

    function GiftCard() {
      _classCallCheck(this, GiftCard);

      return _possibleConstructorReturn(this, (GiftCard.__proto__ || Object.getPrototypeOf(GiftCard)).apply(this, arguments));
    }

    return GiftCard;
  }(library.PaymentMethod);

  library.GiftCard.className = 'GiftCard';
  library.GiftCard.queryName = 'gift_cards';

  library.GiftCard.belongsTo('customer');
  library.GiftCard.hasMany('transactions', { as: 'paymentMethod' });
});

return Occasion;

}));
