Occasion.Modules.push(function (library) {
  library.OrderFulfillmentShipmentDetails = class OrderFulfillmentShipmentDetails extends library.Base {}

  library.OrderFulfillmentShipmentDetails.className = 'OrderFulfillmentShipmentDetails'
  library.OrderFulfillmentShipmentDetails.queryName = 'order_fulfillments_shipment_details'

  library.OrderFulfillmentShipmentDetails.belongsTo('orderFulfillment')
  library.OrderFulfillmentShipmentDetails.hasOne('orderFulfillmentRecipient', { autosave: true })

  library.OrderFulfillmentShipmentDetails.attributes('carrier', 'shippingNote', 'shippingType')
})
