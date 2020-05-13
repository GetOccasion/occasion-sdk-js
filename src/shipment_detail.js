Occasion.Modules.push(function (library) {
  library.ShipmentDetail = class ShipmentDetail extends library.Base {}

  library.ShipmentDetail.className = 'ShipmentDetail'
  library.ShipmentDetail.queryName = 'shipment_details'

  library.ShipmentDetail.belongsTo('fulfillment', { inverseOf: 'shipmentDetails' })
  library.ShipmentDetail.hasOne('recipient', { autosave: true, inverseOf: 'shipmentDetails' })
  library.ShipmentDetail.hasMany('rates')

  library.ShipmentDetail.attributes('carrier', 'shippingNote', 'shippingType')
})
