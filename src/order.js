Occasion.Modules.push(function(library) {
  library.Order = class Order extends library.Base {};

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