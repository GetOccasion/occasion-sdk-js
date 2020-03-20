Occasion.Modules.push(function(library) {
  library.Currency = class Currency extends library.Base {}

  library.Currency.className = 'Currency'
  library.Currency.queryName = 'currencies'

  library.Currency.hasMany('merchants')
  library.Currency.hasMany('orders')
})
