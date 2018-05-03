describe('Occasion.Product', function() {
  beforeEach(function() {
    this.occsnClient = Occasion.Client({ token: 'my_token' });

    moxios.install(this.occsnClient.interface.axios);

    window.onSuccess = jasmine.createSpy('onSuccess');
    window.onFailure = jasmine.createSpy('onFailure');
    window.onCompletion = jasmine.createSpy('onCompletion');
  });

  afterEach(function() {
    moxios.uninstall();
  });

  describe('default timeZone', function() {
    beforeEach(function () {
      moxios.stubRequest(/.+\/products\/1kbsdf.*/, JsonApiResponses.Product.find.includes);
      this.promise = this.occsnClient.Product.includes('merchant').find('1kbsdf')
      .then(window.onSuccess);

      this.promise = moxios.wait(() => {
        this.product = window.onSuccess.calls.mostRecent().args[0];
      });
    });

    it('adds timeZone to product.firstTimeSlotStartsAt', function() {
      return this.promise.then(() => {
        expect(this.product.firstTimeSlotStartsAt.format('z')).toEqual('PDT');
      });
    });
  });

  describe('attendeeQuestions', function() {
    beforeEach(function () {
      this.occsnClient.Product.find('1kbsdf')
      .then(window.onSuccess);

      this.promise = moxios.wait(() => {
        return moxios.requests.mostRecent().respondWith(JsonApiResponses.Product.attendees)
        .then(() => {
          this.product = window.onSuccess.calls.mostRecent().args[0];
        });
      });
    });

    it('builds Collection of attendeeQuestions', function() {
      return this.promise.then(() => {
        expect(this.product.attendeeQuestions.empty()).toBeFalsy();
      });
    });

    it('camelizes attendeeQuestions', function() {
      return this.promise.then(() => {
        expect(this.product.attendeeQuestions.first()).toEqual('firstName');
      });
    });
  });
});
