describe('Occasion.TimeSlot', function() {
  beforeEach(function () {
    this.occsnClient = Occasion.Client({ token: 'my_token' });

    moxios.install(this.occsnClient.interface.axios);

    window.onSuccess = jasmine.createSpy('onSuccess');
    window.onFailure = jasmine.createSpy('onFailure');
    window.onCompletion = jasmine.createSpy('onCompletion');
  });

  afterEach(function () {
    moxios.uninstall();
  });

  describe('valid', function () {
    describe('required checkbox', function() {
      beforeEach(function () {
        this.answer =
          this.occsnClient.Answer.build(
            { question: this.occsnClient.Question.build({ formControl: 'checkbox', required: true }) }
          );
      });

      describe('value YES', function() {
        beforeEach(function() {
          this.answer.value = 'YES';
        });

        it('returns true', function () {
          expect(this.answer.valid()).toBeTruthy();
        });
      });

      describe('value NO', function() {
        beforeEach(function() {
          this.answer.value = 'NO';
        });

        it('returns false', function () {
          expect(this.answer.valid()).toBeFalsy();
        });
      });
    });

    describe('not required checkbox', function() {
      beforeEach(function () {
        this.answer =
          this.occsnClient.Answer.build(
            { question: this.occsnClient.Question.build({ formControl: 'checkbox', required: false }) }
          );
      });

      describe('value YES', function() {
        beforeEach(function() {
          this.answer.value = 'YES';
        });

        it('returns true', function () {
          expect(this.answer.valid()).toBeTruthy();
        });
      });

      describe('value NO', function() {
        beforeEach(function() {
          this.answer.value = 'NO';
        });

        it('returns true', function () {
          expect(this.answer.valid()).toBeTruthy();
        });
      });
    });

    describe('waiver', function() {
      beforeEach(function () {
        this.answer =
          this.occsnClient.Answer.build(
            { question: this.occsnClient.Question.build({ formControl: 'waiver' }) }
          );
      });

      describe('value YES', function() {
        beforeEach(function() {
          this.answer.value = 'YES';
        });

        it('returns true', function () {
          expect(this.answer.valid()).toBeTruthy();
        });
      });

      describe('value NO', function() {
        beforeEach(function() {
          this.answer.value = 'NO';
        });

        it('returns false', function () {
          expect(this.answer.valid()).toBeFalsy();
        });
      });
    });

    describe('required text', function() {
      beforeEach(function () {
        this.answer =
          this.occsnClient.Answer.build(
            { question: this.occsnClient.Question.build({ formControl: 'text_input', required: true }) }
          );
      });

      describe('value exists', function() {
        beforeEach(function() {
          this.answer.value = 'text';
        });

        it('returns true', function () {
          expect(this.answer.valid()).toBeTruthy();
        });
      });

      describe('value does not exist', function() {
        beforeEach(function() {
          this.answer.value = '';
        });

        it('returns false', function () {
          expect(this.answer.valid()).toBeFalsy();
        });
      });
    });

    describe('not required text', function() {
      beforeEach(function () {
        this.answer =
          this.occsnClient.Answer.build(
            { question: this.occsnClient.Question.build({ formControl: 'text_input', required: false }) }
          );
      });

      describe('value exists', function() {
        beforeEach(function() {
          this.answer.value = 'text';
        });

        it('returns true', function () {
          expect(this.answer.valid()).toBeTruthy();
        });
      });

      describe('value does not exist', function() {
        beforeEach(function() {
          this.answer.value = '';
        });

        it('returns true', function () {
          expect(this.answer.valid()).toBeTruthy();
        });
      });
    });

    describe('required optionable', function() {
      beforeEach(function () {
        this.answer =
          this.occsnClient.Answer.build(
            { question: this.occsnClient.Question.build({ formControl: 'dropdown', optionable: true, required: true }) }
          );
      });

      describe('option assigned', function() {
        beforeEach(function() {
          this.answer.assignOption(this.occsnClient.Option.build({ id: '1' }));
        });

        it('returns true', function () {
          expect(this.answer.valid()).toBeTruthy();
        });
      });

      describe('option not assigned', function() {
        it('returns false', function () {
          expect(this.answer.valid()).toBeFalsy();
        });
      });
    });

    describe('not required optionable', function() {
      beforeEach(function () {
        this.answer =
          this.occsnClient.Answer.build(
            { question: this.occsnClient.Question.build({ formControl: 'dropdown', optionable: true, required: false }) }
          );
      });

      describe('option assigned', function() {
        beforeEach(function() {
          this.answer.assignOption(this.occsnClient.Option.build({ id: '1' }));
        });

        it('returns true', function () {
          expect(this.answer.valid()).toBeTruthy();
        });
      });

      describe('option not assigned', function() {
        it('returns true', function () {
          expect(this.answer.valid()).toBeTruthy();
        });
      });
    });
  });
});
