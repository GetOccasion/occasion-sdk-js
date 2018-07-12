Occasion.Modules.push(function(library) {
  library.Attendee = class Attendee extends library.Base {
    complete() {
      return !this.order().product().attendeeQuestions.detect((question) => {
        return !this[question] || this[question].length == 0;
      });
    }
  };

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
