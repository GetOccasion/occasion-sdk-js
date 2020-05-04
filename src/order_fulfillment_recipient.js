Occasion.Modules.push(function (library) {
  library.OrderFulfillmentRecipient = class OrderFulfillmentRecipient extends library.Base {}

  library.OrderFulfillmentRecipient.className = 'OrderFulfillmentRecipient'
  library.OrderFulfillmentRecipient.queryName = 'order_fulfillments'

  library.OrderFulfillmentRecipient.belongsTo('orderFulfillmentDetails')

  library.OrderFulfillmentRecipient.attributes(
    'addressLine1',
    'addressLine2',
    'addressLine3',
    'administrativeDistrictLevel1',
    'administrativeDistrictLevel2',
    'administrativeDistrictLevel3',
    'country',
    'displayName',
    'emailAddress',
    'firstName',
    'lastName',
    'locality',
    'organization',
    'phoneNumber',
    'postalCode',
    'sublocality',
    'sublocality2',
    'sublocality3'
  )
})
