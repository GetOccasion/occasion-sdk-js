Occasion.Modules.push(function (library) {
  library.Fulfillment = class Fulfillment extends library.Base {}

  library.Fulfillment.className = 'Fulfillment'
  library.Fulfillment.queryName = 'fulfillments'

  library.Fulfillment.belongsTo('order')
  library.Fulfillment.hasOne('shipmentDetails', { autosave: true })
  library.Fulfillment.hasOne('pickupDetails', { autosave: true })

  library.Fulfillment.attributes('fulfillmentType')
})
