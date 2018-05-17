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

  describe('duration', function () {
    beforeEach(function () {
      moxios.stubRequest(/.+\/time_slots.*/, JsonApiResponses.TimeSlot.index);

      this.occsnClient.TimeSlot.first()
      .then(window.onSuccess);

      this.promise = moxios.wait(() => {
        this.timeSlot = window.onSuccess.calls.mostRecent().args[0];
      });
    });

    it('transforms to moment', function () {
      return this.promise.then(() => {
        expect(this.timeSlot.duration.humanize()).toEqual('an hour');
      });
    });
  });

  describe('startsAt', function () {
    beforeEach(function () {
      moxios.stubRequest(/.+\/time_slots.*/, JsonApiResponses.TimeSlot.index);

      this.occsnClient.TimeSlot.first()
      .then(window.onSuccess);

      this.promise = moxios.wait(() => {
        this.timeSlot = window.onSuccess.calls.mostRecent().args[0];
      });
    });

    it('transforms to moment', function () {
      return this.promise.then(() => {
        expect(this.timeSlot.startsAt.toDate).toBeDefined();
      });
    });
  });
});
