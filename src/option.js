Occasion.Modules.push(function(library) {
  library.Option = class Option extends library.Base {}

  library.Option.className = 'Option'
  library.Option.queryName = 'options'

  library.Option.belongsTo('answer')
  library.Option.belongsTo('question')
})
