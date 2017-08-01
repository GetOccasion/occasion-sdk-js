Occasion.Modules.push(function(library) {
  library.Transaction = class Transaction extends library.Base {};

  library.Transaction.className = 'Transaction';
  library.Transaction.queryName = 'transactions';

  library.Transaction.belongsTo('order');
  library.Transaction.belongsTo('paymentMethod', { polymorphic: true });
});