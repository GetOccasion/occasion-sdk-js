Occasion.Modules.push(function(library) {
  library.Transaction = class Transaction extends library.Base {};

  library.Transaction.className = 'Transaction';
  library.Transaction.queryName = 'transactions';

  library.Transaction.attributes('amount');

  library.Transaction.belongsTo('order', { inverseOf: 'answers' });
  library.Transaction.belongsTo('paymentMethod', { polymorphic: true });
});
