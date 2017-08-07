Occasion.Modules.push(function(library) {
  library.GiftCard = class GiftCard extends library.PaymentMethod {};

  library.GiftCard.className = 'GiftCard';
  library.GiftCard.queryName = 'gift_cards';

  library.GiftCard.belongsTo('customer');
  library.GiftCard.hasMany('transactions', { as: 'paymentMethod' });
});