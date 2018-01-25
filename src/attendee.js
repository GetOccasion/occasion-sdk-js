Occasion.Modules.push(function(library) {
  library.Attendee = class Attendee extends library.Base {};

  library.Attendee.className = 'Attendee';
  library.Attendee.queryName = 'attendees';

  library.Attendee.belongsTo('order');
});
