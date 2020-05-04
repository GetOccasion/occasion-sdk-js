Occasion.Modules.push(function (library) {
  library.OrderFulfillmentPickupDetails = class OrderFulfillmentPickupDetails extends library.Base {}

  library.OrderFulfillmentPickupDetails.className = 'OrderFulfillmentPickupDetails'
  library.OrderFulfillmentPickupDetails.queryName = 'order_fulfillments_pickup_details'

  library.OrderFulfillmentPickupDetails.belongsTo('orderFulfillment')
  library.OrderFulfillmentShippingDetails.hasOne('orderFulfillmentRecipient', { autosave: true })

  library.OrderFulfillmentPickupDetails.attributes(
    'expiredAt',
    'expiresAt',
    'isCurbsidePickup',
    'curbsideDetails',
    'pickupAt',
    'pickupWindowDuration',
    'readyAt',
    'scheduleType',
    'placedAt'
  )
})
