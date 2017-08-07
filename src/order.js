Occasion.Modules.push(function(library) {
  library.Order = class Order extends library.Base {
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