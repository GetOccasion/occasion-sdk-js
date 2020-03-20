Occasion.Modules.push(function(library) {
  library.CreditCard = class CreditCard extends library.PaymentMethod {}

  library.CreditCard.className = 'CreditCard'
  library.CreditCard.queryName = 'credit_cards'

  library.CreditCard.hasMany('transactions', { as: 'paymentMethod' })
})
