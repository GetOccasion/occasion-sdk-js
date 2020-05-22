Occasion.Modules.push(function (library) {
  library.Recipient = class Recipient extends library.Base {}

  library.Recipient.className = 'Recipient'
  library.Recipient.queryName = 'recipients'

  library.Recipient.attributes(
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
