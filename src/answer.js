Occasion.Modules.push(function(library) {
  library.Answer = class Answer extends library.Base {};

  library.Answer.className = 'Answer';
  library.Answer.queryName = 'answers';

  library.Answer.attributes('value');

  library.Answer.belongsTo('question');
  library.Answer.belongsTo('option');
  library.Answer.belongsTo('order');
});
