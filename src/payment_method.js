Occasion.Modules.push(function(library) {
  library.PaymentMethod = class PaymentMethod extends library.Base {}

  library.PaymentMethod.className = 'PaymentMethod'
  library.PaymentMethod.queryName = 'payment_methods'

  library.PaymentMethod.hasMany('transactions', { as: 'paymentMethod' })
})
