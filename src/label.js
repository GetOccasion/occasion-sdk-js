Occasion.Modules.push(function(library) {
  library.Label = class Label extends library.Base {};

  library.Label.className = 'Label';
  library.Label.queryName = 'labels';

  library.Label.belongsTo('product');
});
