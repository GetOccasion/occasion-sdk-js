Occasion.Modules.push(function(library) {
  // TODO: Remove ability to directly query redeemables
  library.Redeemable = class Redeemable extends library.Base {}

  library.Redeemable.className = 'Redeemable'
  library.Redeemable.queryName = 'redeemables'

  library.Redeemable.belongsTo('product')
})
