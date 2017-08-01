Occasion.Modules.push(function(library) {
  library.Product = class Product extends library.Base {};

  library.Product.className = 'Product';
  library.Product.queryName = 'products';

  library.Product.belongsTo('merchant');
  library.Product.belongsTo('venue');

  library.Product.hasMany('orders');
  library.Product.hasMany('timeSlots');
});