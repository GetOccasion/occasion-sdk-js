Occasion.Modules.push(function (library) {
  library.ShipmentDetail = class ShipmentDetail extends library.Base {}

  library.ShipmentDetail.className = 'ShipmentDetail'
  library.ShipmentDetail.queryName = 'shipment_details'

  library.ShipmentDetail.belongsTo('fulfillment')
  library.ShipmentDetail.hasOne('recipient', { autosave: true })
  library.ShipmentDetail.hasMany('rates')

  library.ShipmentDetail.attributes('carrier', 'shippingNote', 'shippingType')
})
