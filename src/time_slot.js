Occasion.Modules.push(function(library) {
  library.TimeSlot = class TimeSlot extends library.Base {};

  library.TimeSlot.className = 'TimeSlot';
  library.TimeSlot.queryName = 'time_slots';

  library.TimeSlot.belongsTo('product');
  library.TimeSlot.belongsTo('venue');
});