Occasion.Modules.push(function(library) {
  library.Answer = class Answer extends library.Base {
    valid() {
      switch(this.question().formControl) {
        case 'checkbox':
        case 'waiver':
          return !(this.question().required || this.question().formControl == 'waiver') ||
            (this.value == 'YES' || (this.value != 'NO' && this.value));
        default:
          return !this.question().required ||
            ((this.question().optionable && this.option()) ||
            (!this.question().optionable && this.value && this.value != ''));
      }
    }
  };

  library.Answer.className = 'Answer';
  library.Answer.queryName = 'answers';

  library.Answer.attributes('value');

  library.Answer.belongsTo('question');
  library.Answer.belongsTo('option');
  library.Answer.belongsTo('order', { inverseOf: 'answers' });
});
