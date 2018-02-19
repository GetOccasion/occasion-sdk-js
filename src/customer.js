Occasion.Modules.push(function(library) {
  library.Customer = class Customer extends library.Base {};

  library.Customer.className = 'Customer';
  library.Customer.queryName = 'customers';

  library.Customer.hasMany('orders');
});
