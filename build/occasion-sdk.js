class Occasion {
  static baseUrl = 'https://app.getoccasion.com/api/v1';

  static Client(token) {
    var encodedToken = window.btoa(unescape(encodeURIComponent(token + ':')));

    var resourceLibrary =
      ActiveResource.createResourceLibrary(Occasion.baseUrl, {
        headers: {
          Authorization: "Basic " + encodedToken,
          'User-Agent': 'OccasionSDK'
        }
      });

    Occasion.Modules.each(function(initializeModule) { initializeModule(resourceLibrary) });

    return resourceLibrary;
  }
}
Occasion.Modules = ActiveResource.prototype.Collection.build();
Occasion.Modules.push(function(library) {
  library.Answer = class Answer extends library.Base {};

  library.Answer.className = 'Answer';
  library.Answer.queryName = 'answers';

  library.Answer.belongsTo('question');
  library.Answer.belongsTo('option');
  library.Answer.belongsTo('order');
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
  library.Customer = class Customer extends library.Base {};

  library.Customer.className = 'Customer';
  library.Customer.queryName = 'customers';
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
        promises.push(order.product().questions().includes('options').all());
      }

      return axios.all(promises)
      .then(axios.spread(function(order, questions) {
        // Add blank answer for each question
        if(questions != undefined) {
          questions.each(function(question) {
            order.answers().build({
              question: question
            });
          });
        }

        return order;
      }));
    }

    // Creates a transaction with a payment method and an amount
    //
    // @param [PaymentMethod] paymentMethod the payment method to charge
    // @param [Number] amount the amount to charge to the payment method
    // @return [Transaction] the built transaction representing the charge
    charge(paymentMethod, amount) {
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
  };

  library.Order.className = 'Order';
  library.Order.queryName = 'orders';

  library.Order.belongsTo('coupon');
  library.Order.belongsTo('currency');
  library.Order.belongsTo('customer', { autosave: true });
  library.Order.belongsTo('merchant');
  library.Order.belongsTo('product');

  library.Order.hasMany('answers', { autosave: true });
  library.Order.hasMany('timeSlots');
  library.Order.hasMany('transactions', { autosave: true });
});
Occasion.Modules.push(function(library) {
  library.PaymentMethod = class PaymentMethod extends library.Base {};

  library.PaymentMethod.className = 'PaymentMethod';
  library.PaymentMethod.queryName = 'payment_methods';

  library.PaymentMethod.hasMany('transactions', { as: 'paymentMethod' });
});
Occasion.Modules.push(function(library) {
  library.Product = class Product extends library.Base {};

  library.Product.className = 'Product';
  library.Product.queryName = 'products';

  library.Product.belongsTo('merchant');
  library.Product.belongsTo('venue');

  library.Product.hasMany('orders');
  library.Product.hasMany('questions');
  library.Product.hasMany('timeSlots');
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
  library.TimeSlot = class TimeSlot extends library.Base {};

  library.TimeSlot.className = 'TimeSlot';
  library.TimeSlot.queryName = 'time_slots';

  library.TimeSlot.belongsTo('product');
  library.TimeSlot.belongsTo('venue');
});
Occasion.Modules.push(function(library) {
  library.Transaction = class Transaction extends library.Base {};

  library.Transaction.className = 'Transaction';
  library.Transaction.queryName = 'transactions';

  library.Transaction.belongsTo('order');
  library.Transaction.belongsTo('paymentMethod', { polymorphic: true });
});
Occasion.Modules.push(function(library) {
  library.Venue = class Venue extends library.Base {};

  library.Venue.className = 'Venue';
  library.Venue.queryName = 'venues';

  library.Venue.belongsTo('merchant');

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