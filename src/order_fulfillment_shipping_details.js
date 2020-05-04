Occasion.Modules.push(function (library) {
  library.OrderFulfillmentShippingDetails = class OrderFulfillmentShippingDetails extends library.Base {}

  library.OrderFulfillmentShippingDetails.className = 'OrderFulfillmentShippingDetails'
  library.OrderFulfillmentShippingDetails.queryName = 'order_fulfillments_shipping_details'

  library.OrderFulfillmentShippingDetails.belongsTo('orderFulfillment')
  library.OrderFulfillmentShippingDetails.hasOne('orderFulfillmentRecipient', { autosave: true })

  library.OrderFulfillmentShippingDetails.attributes('carrier', 'shippingNote', 'shippingType')
})
