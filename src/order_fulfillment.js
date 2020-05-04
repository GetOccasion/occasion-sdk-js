Occasion.Modules.push(function (library) {
  library.OrderFulfillment = class OrderFulfillment extends library.Base {}

  library.OrderFulfillment.className = 'OrderFulfillment'
  library.OrderFulfillment.queryName = 'order_fulfillments'

  library.OrderFulfillment.belongsTo('order')
  library.OrderFulfillment.hasOne('orderFulfillmentShipmentDetails', { autosave: true })
  library.OrderFulfillment.hasOne('orderFulfillmentPickupDetails', { autosave: true })

  library.OrderFulfillment.attributes('fulfillmentType')
})
