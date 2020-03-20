Occasion.Modules.push(function(library) {
  library.Coupon = class Coupon extends library.Base {}

  library.Coupon.className = 'Coupon'
  library.Coupon.queryName = 'coupons'

  library.Coupon.belongsTo('merchant')
  library.Coupon.hasMany('orders')
})
