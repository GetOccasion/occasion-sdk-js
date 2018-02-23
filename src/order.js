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

      return Promise.all(promises)
      .then(function(args) {
        order = args[0];
        var questions = args[1];

        // Add blank answer for each question not of category 'static'
        if(questions != undefined) {
          questions.each(function(question) {

            if(question.category != 'static') {
              order.answers().build({
                question: question
              });
            }
          });
        }

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
  library.Order.belongsTo('customer', { autosave: true, inverseOf: 'orders' });
  library.Order.belongsTo('merchant');
  library.Order.belongsTo('product');

  library.Order.hasMany('answers', { autosave: true });
  library.Order.hasMany('attendees', { autosave: true });
  library.Order.hasMany('timeSlots');
  library.Order.hasMany('transactions', { autosave: true });
});
