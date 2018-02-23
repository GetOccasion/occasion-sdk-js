(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["active-resource","axios","underscore"], function (a0,b1,c2) {
      return (root['Occasion'] = factory(a0,b1,c2));
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("active-resource"),require("axios"),require("underscore"));
  } else {
    root['Occasion'] = factory(root["active-resource"],root["axios"],root["underscore"]);
  }
}(this, function (ActiveResource, axios, _) {

'use strict';

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
        immutable: immutable
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
Occasion.Modules.push(function (library) {
  library.Answer = function (_library$Base) {
    _inherits(Answer, _library$Base);

    function Answer() {
      _classCallCheck(this, Answer);

      return _possibleConstructorReturn(this, (Answer.__proto__ || Object.getPrototypeOf(Answer)).apply(this, arguments));
    }

    return Answer;
  }(library.Base);

  library.Answer.className = 'Answer';
  library.Answer.queryName = 'answers';

  library.Answer.belongsTo('question');
  library.Answer.belongsTo('option');
  library.Answer.belongsTo('order');
});
Occasion.Modules.push(function (library) {
  library.Attendee = function (_library$Base2) {
    _inherits(Attendee, _library$Base2);

    function Attendee() {
      _classCallCheck(this, Attendee);

      return _possibleConstructorReturn(this, (Attendee.__proto__ || Object.getPrototypeOf(Attendee)).apply(this, arguments));
    }

    return Attendee;
  }(library.Base);

  library.Attendee.className = 'Attendee';
  library.Attendee.queryName = 'attendees';

  library.Attendee.belongsTo('order');
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

    return Customer;
  }(library.Base);

  library.Customer.className = 'Customer';
  library.Customer.queryName = 'customers';

  library.Customer.hasMany('orders', { inverseOf: 'customer' });
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
        this.transactions().build({
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
    }], [{
      key: 'construct',
      value: function construct(attributes) {
        var order = this.build(attributes);

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
          promises.push(order.product().questions().includes('options').all());
        }

        return axios.all(promises).then(axios.spread(function (order, questions) {
          // Add blank answer for each question not of category 'static'
          if (questions != undefined) {
            questions.each(function (question) {

              if (question.category != 'static') {
                order.answers().build({
                  question: question
                });
              }
            });
          }

          return order;
        }));
      }
    }]);

    return Order;
  }(library.Base);

  library.Order.className = 'Order';
  library.Order.queryName = 'orders';

  library.Order.belongsTo('coupon');
  library.Order.belongsTo('currency');
  library.Order.belongsTo('customer', { autosave: true, inverseOf: 'orders' });
  library.Order.belongsTo('merchant');
  library.Order.belongsTo('product');

  library.Order.hasMany('answers', { autosave: true });
  library.Order.hasMany('attendees', { autosave: true });
  library.Order.hasMany('timeSlots');
  library.Order.hasMany('transactions', { autosave: true });
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
  library.TimeSlot = function (_library$Base14) {
    _inherits(TimeSlot, _library$Base14);

    function TimeSlot() {
      _classCallCheck(this, TimeSlot);

      return _possibleConstructorReturn(this, (TimeSlot.__proto__ || Object.getPrototypeOf(TimeSlot)).apply(this, arguments));
    }

    return TimeSlot;
  }(library.Base);

  library.TimeSlot.className = 'TimeSlot';
  library.TimeSlot.queryName = 'time_slots';

  library.TimeSlot.belongsTo('product');
  library.TimeSlot.belongsTo('venue');
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

  library.Transaction.belongsTo('order');
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
