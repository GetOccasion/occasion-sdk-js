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

  describe('constructCalendar(timeZone, month)', function() {
    beforeEach(function () {
      jasmine.clock().mockDate(moment.tz('2018-05-09', 'America/Los_Angeles').toDate());

      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-09.+/, JsonApiResponses.TimeSlot.calendar[1]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-16.+/, JsonApiResponses.TimeSlot.calendar[2]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-23.+/, JsonApiResponses.TimeSlot.calendar[3]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-30.+/, JsonApiResponses.TimeSlot.calendar[4]);

      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-06-01.+/, JsonApiResponses.TimeSlot.calendar[0]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-06-08.+/, JsonApiResponses.TimeSlot.calendar[1]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-06-15.+/, JsonApiResponses.TimeSlot.calendar[2]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-06-22.+/, JsonApiResponses.TimeSlot.calendar[3]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-06-29.+/, JsonApiResponses.TimeSlot.calendar[4]);

      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-07-01.+/, JsonApiResponses.TimeSlot.calendar[0]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-07-08.+/, JsonApiResponses.TimeSlot.calendar[1]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-07-15.+/, JsonApiResponses.TimeSlot.calendar[2]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-07-22.+/, JsonApiResponses.TimeSlot.calendar[3]);
      moxios.stubRequest(/.+\/v1\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-07-29.+/, JsonApiResponses.TimeSlot.calendar[4]);

      this.occsnClient.Product.find('1kbsdf')
      .then(window.onSuccess);

      this.promise = moxios.wait(() => {
        return moxios.requests.mostRecent().respondWith(JsonApiResponses.Product.calendar)
        .then(() => {
          this.product = window.onSuccess.calls.mostRecent().args[0];

          return this.occsnClient.TimeSlot.constructCalendar(this.product.merchant().timeZone).then((collection) => {
            this.calendarCollection = collection;
          });
        });
      });
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });

    it('starts at current day and adds all days in current month as items to collection', function() {
      return this.promise.then(() => {
        expect(this.calendarCollection.size()).toBe(31);
      });
    });
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
