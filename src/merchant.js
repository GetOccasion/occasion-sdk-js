Occasion.Modules.push(function (library) {
  library.Merchant = class Merchant extends library.Base {}

  library.Merchant.className = 'Merchant'
  library.Merchant.queryName = 'merchants'

  library.Merchant.belongsTo('currency')
  library.Merchant.hasMany('products')
  library.Merchant.hasMany('venues')
})
