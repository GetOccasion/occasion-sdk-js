Occasion.Modules.push(function(library) {
  library.Venue = class Venue extends library.Base {};

  library.Venue.className = 'Venue';
  library.Venue.queryName = 'venues';

  library.Venue.belongsTo('merchant');

  library.Venue.hasMany('products');
});