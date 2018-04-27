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
    'first_name',
    'gender',
    'last_name',
    'phone',
    'state',
    'zip'
  );

  library.Attendee.belongsTo('order', { inverseOf: 'attendees' });
});
