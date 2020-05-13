Occasion.Modules.push(function (library) {
  library.Fulfillment = class Fulfillment extends library.Base {}
  library.Fulfillment.className = 'Fulfillment'
  library.Fulfillment.queryName = 'fulfillments'
  library.Fulfillment.belongsTo('order', { inverseOf: 'fulfillment' })
  library.Fulfillment.hasOne('shipmentDetails', { autosave: true, inverseOf: 'fulfillment' })
  library.Fulfillment.hasOne('pickupDetails', { autosave: true, inverseOf: 'fulfillment' })
  library.Fulfillment.attributes('fulfillmentType')
})
