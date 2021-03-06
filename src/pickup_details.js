Occasion.Modules.push(function (library) {
  library.PickupDetail = class PickupDetail extends library.Base {}

  library.PickupDetail.className = 'PickupDetail'
  library.PickupDetail.queryName = 'pickup_details'

  library.PickupDetail.belongsTo('fulfillment', { inverseOf: 'pickupDetails' })

  library.PickupDetail.attributes(
    'expiredAt',
    'expiresAt',
    'isCurbsidePickup',
    'curbsideDetails',
    'pickupAt',
    'pickupWindowDuration',
    'readyAt',
    'scheduleType',
    'placedAt',
    'dropoffAt'
  )
})
