Occasion.Modules.push(function(library) {
  library.Question = class Question extends library.Base {}

  library.Question.className = 'Question'
  library.Question.queryName = 'questions'

  library.Question.belongsTo('product')
  library.Question.hasMany('answers')
  library.Question.hasMany('options')
})
