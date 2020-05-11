Occasion.Modules.push(function (library) {
  library.Rate = class Rate extends library.Base {}

  library.Rate.className = 'Rate'
  library.Rate.queryName = 'rates'

  library.Rate.attributes('fulfillment_uid', 'fee', 'eta', 'carrier', 'service', 'expires_at')
})
