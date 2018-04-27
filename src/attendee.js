Occasion.Modules.push(function(library) {
  library.Attendee = class Attendee extends library.Base {};

  library.Attendee.className = 'Attendee';
  library.Attendee.queryName = 'attendees';

  library.Attendee.attributes(
    'address',
    'age',
    'city',
    'country',
    'email',
    'firstName',
    'gender',
    'lastName',
    'phone',
    'state',
    'zip'
  );

  library.Attendee.belongsTo('order', { inverseOf: 'attendees' });
});
