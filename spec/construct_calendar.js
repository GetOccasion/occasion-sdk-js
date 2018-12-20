describe('__constructCalendar()', function() {
  beforeEach(function() {
    this.occsnClient = Occasion.Client({ token: 'my_token' });

    moxios.install(this.occsnClient.interface.axios);

    window.onSuccess = jasmine.createSpy('onSuccess');
    window.onFailure = jasmine.createSpy('onFailure');
    window.onCompletion = jasmine.createSpy('onCompletion');

    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-01.+/, JsonApiResponses.TimeSlot.calendar[0]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-08.+/, JsonApiResponses.TimeSlot.calendar[1]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-15.+/, JsonApiResponses.TimeSlot.calendar[2]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-22.+/, JsonApiResponses.TimeSlot.calendar[3]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-29.+/, JsonApiResponses.TimeSlot.calendar[4]);

    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-09.+/, JsonApiResponses.TimeSlot.calendar[1]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-16.+/, JsonApiResponses.TimeSlot.calendar[2]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-23.+/, JsonApiResponses.TimeSlot.calendar[3]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-05-30.+/, JsonApiResponses.TimeSlot.calendar[4]);

    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-06-01.+/, JsonApiResponses.TimeSlot.calendar[0]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-06-08.+/, JsonApiResponses.TimeSlot.calendar[1]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-06-15.+/, JsonApiResponses.TimeSlot.calendar[2]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-06-22.+/, JsonApiResponses.TimeSlot.calendar[3]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-06-29.+/, JsonApiResponses.TimeSlot.calendar[4]);

    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-07-01.+/, JsonApiResponses.TimeSlot.calendar[0]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-07-08.+/, JsonApiResponses.TimeSlot.calendar[1]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-07-15.+/, JsonApiResponses.TimeSlot.calendar[2]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-07-22.+/, JsonApiResponses.TimeSlot.calendar[3]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-07-29.+/, JsonApiResponses.TimeSlot.calendar[4]);

    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-08-01.+/, JsonApiResponses.TimeSlot.calendar[0]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-08-08.+/, JsonApiResponses.TimeSlot.calendar[1]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-08-15.+/, JsonApiResponses.TimeSlot.calendar[2]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-08-22.+/, JsonApiResponses.TimeSlot.calendar[3]);
    moxios.stubRequest(/.+\/time_slots\/\?.*filter%5Bstarts_at%5D%5Bge%5D=2018-08-29.+/, JsonApiResponses.TimeSlot.calendar[4]);
  });

  beforeEach(function () {
    this.occsnClient.Product.find('1kbsdf')
    .then(window.onSuccess);

    this.promise = moxios.wait(() => {
      return moxios.requests.mostRecent().respondWith(JsonApiResponses.Product.calendar)
      .then(() => {
        this.product = window.onSuccess.calls.mostRecent().args[0];
      });
    });
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    moxios.uninstall();
  });

  describe('no month arg', function() {
    beforeEach(function() {
      jasmine.clock().mockDate(moment.tz('2018-05-09', 'America/Los_Angeles').toDate());

      return this.promise2 = this.promise.then(() => {
        spyOn(Occasion, '__constructCalendar').and.callThrough();

        return Occasion.__constructCalendar(
          undefined,
          {
            monthlyTimeSlotDaysBatchSize: this.product.monthlyTimeSlotDaysBatchSize,
            monthlyTimeSlotPreloadSize: this.product.monthlyTimeSlotPreloadSize,
            relation: this.product.timeSlots(),
            timeZone: this.product.merchant().timeZone
          }
        ).then((collection) => {
          this.calendarCollection = collection;
        });
      });
    });

    it('starts at beginning of current month', function() {
      return this.promise2.then(() => {
        expect(moxios.requests.at(1).url).toContain('2018-05-01');
      });
    });

    it('adds all days in current month as items to collection', function() {
      return this.promise2.then(() => {
        expect(this.calendarCollection.size()).toBe(31);
      });
    });

    it('does not have prevPage for months before today', function() {
      return this.promise2.then(() => {
        expect(this.calendarCollection.hasPrevPage()).toBeFalsy();
      });
    });

    describe('preloading', function() {
      it('preloads appropriate months', function() {
        return this.promise2.then(() => {
          return moxios.wait(() => {
            expect(Occasion.__constructCalendar).toHaveBeenCalledTimes(3);
          });
        });
      });
    });
  });

  describe('current month as arg', function() {
    beforeEach(function() {
      this.promise2 = this.promise.then(() => {
        jasmine.clock().mockDate(moment.tz('2018-05-09', this.product.merchant().timeZone).toDate());

        return Occasion.__constructCalendar(
          moment.tz('2018-05-01', this.product.merchant().timeZone),
          {
            monthlyTimeSlotDaysBatchSize: this.product.monthlyTimeSlotDaysBatchSize,
            monthlyTimeSlotPreloadSize: this.product.monthlyTimeSlotPreloadSize,
            relation: this.occsnClient.TimeSlot,
            timeZone: this.product.merchant().timeZone
          }
        ).then((collection) => {
          this.calendarCollection = collection;
        });
      });
    });

    it('starts at beginning of month', function() {
      return this.promise2.then(() => {
        expect(moxios.requests.at(1).url).toContain('2018-05-01');
      });
    });

    it('adds all days in current month as items to collection', function() {
      return this.promise2.then(() => {
        expect(this.calendarCollection.size()).toBe(31);
      });
    });

    describe('hasNextPage()', function() {
      it('returns true', function() {
        return this.promise2.then(() => {
          expect(this.calendarCollection.hasNextPage()).toBeTruthy();
        });
      });
    });

    describe('nextPage()', function() {
      beforeEach(function() {
        this.promise3 = this.promise2.then(() => {
          return moxios.wait(() => {
            spyOn(Occasion, '__constructCalendar').and.callThrough();
            return this.calendarCollection.nextPage()
              .then((collection) => {
                collection.nextPage();

                return moxios.wait(() => {}, 100);
              });
          }, 100);
        });
      });

      it('preloads next month of timeSlots', function() {
        return this.promise3.then(() => {
          var i = Occasion.__constructCalendar.calls.count() - 2;
          expect(Occasion.__constructCalendar.calls.all()[i].args[0].isSame(moment.tz('2018-08-01', this.product.merchant().timeZone))).toBeTruthy();
        });
      });

      it('preloads next next month of timeSlots', function() {
        return this.promise3.then(() => {
          expect(Occasion.__constructCalendar.calls.mostRecent().args[0].isSame(moment.tz('2018-09-01', this.product.merchant().timeZone))).toBeTruthy();
        });
      });

      describe('calling prevPage() after', function() {
        beforeEach(function() {
          this.promise4 = this.promise3.then(() => {
            this.constructCalendarCount = Occasion.__constructCalendar.calls.count();

            return this.calendarCollection.prevPage();
          });
        });

        it('uses same promise as before', function() {
          return this.promise4.then(() => {
            expect(Occasion.__constructCalendar.calls.count()).toEqual(this.constructCalendarCount);
          });
        });
      });
    });

    describe('hasPrevPage()', function() {
      it('it returns false', function() {
        return this.promise2.then(() => {
          expect(this.calendarCollection.hasPrevPage()).toBeFalsy();
        });
      });
    });

    describe('prevPage()', function() {
      beforeEach(function() {
        this.promise3 = this.promise2.then(() => {
          spyOn(Occasion, '__constructCalendar').and.callThrough();

          return this.calendarCollection.prevPage();
        });
      });

      it('does not call prev month of timeSlots', function() {
        return this.promise3.then(() => {
          expect(Occasion.__constructCalendar.calls.count()).toEqual(0);
        });
      });
    });
  });

  describe('other month as arg', function() {
    beforeEach(function() {
      this.promise2 = this.promise.then(() => {
        jasmine.clock().mockDate(moment.tz('2018-04-01', this.product.merchant().timeZone).toDate());

        return Occasion.__constructCalendar(
          moment.tz('2018-05-01', this.product.merchant().timeZone),
          {
            monthlyTimeSlotDaysBatchSize: this.product.monthlyTimeSlotDaysBatchSize,
            monthlyTimeSlotPreloadSize: this.product.monthlyTimeSlotPreloadSize,
            preload: 0,
            relation: this.product.timeSlots(),
            timeZone: this.product.merchant().timeZone
          }
        ).then((collection) => {
          this.calendarCollection = collection;
        });
      });
    });

    it('returns CollectionResponse', function() {
      return this.promise2.then(() => {
        expect(this.calendarCollection.klass()).toBe(ActiveResource.CollectionResponse);
      });
    });

    it('returns collection separated by objects with day and timeSlot keys', function() {
      return this.promise2.then(() => {
        expect(this.calendarCollection.first().day).toBeDefined();
        expect(this.calendarCollection.first().timeSlots).toBeDefined();
      });
    });

    it('returns item.day as moment object', function() {
      return this.promise2.then(() => {
        expect(this.calendarCollection.first().day.format).toBeDefined();
      });
    });

    it('returns item.timeSlots as Collection', function() {
      return this.promise2.then(() => {
        expect(this.calendarCollection.first().timeSlots.klass()).toBe(ActiveResource.Collection);
      });
    });

    it('adds all days in month as items to collection', function() {
      return this.promise2.then(() => {
        expect(this.calendarCollection.size()).toBe(31);
      });
    });

    it('adds all timeSlots for each day to item.timeSlots', function() {
      return this.promise2.then(() => {
        expect(this.calendarCollection.first().timeSlots.size()).toBe(2);
        expect(this.calendarCollection.last().timeSlots.size()).toBe(5);
      });
    });
  });

  describe('with queryParams', function() {
    beforeEach(function() {
      jasmine.clock().mockDate(moment.tz('2018-05-09', 'America/Los_Angeles').toDate());

      this.promise2 = this.promise.then(() => {
        return this.occsnClient.TimeSlot.where({
          keywords: 'lorem',
          venue: [
            this.occsnClient.Venue.build({ id: '1' }),
            this.occsnClient.Venue.build({ id: '2' }),
          ]
        }).constructCalendar({ timeZone: this.product.merchant().timeZone });
      });
    });

    it('adds relation queryParams to query', function() {
      return this.promise2.then(() => {
        expect(moxios.requests.mostRecent().url).toContain(qs.stringify({ filter: { keywords: 'lorem', venue: '1,2' } }));
      });
    });
  });

  describe('options', function() {
    describe('status', function() {
      beforeEach(function() {
        jasmine.clock().mockDate(moment.tz('2018-05-09', 'America/Los_Angeles').toDate());

        this.promise2 = this.promise.then(() => {
          return this.occsnClient.TimeSlot.constructCalendar(
            {
              status: 'upcoming',
              timeZone: this.product.merchant().timeZone
            }
          ).then((collection) => {
            this.calendarCollection = collection;
          });
        });
      });

      it('changes time slot status filter', function() {
        return this.promise2.then(() => {
          expect(moxios.requests.mostRecent().url).toContain(qs.stringify({ filter: { status: 'upcoming' } }));
        });
      });

      it('has prevPage for months before today', function() {
        return this.promise2.then(() => {
          expect(this.calendarCollection.hasPrevPage()).toBeTruthy();
        })
      });
    });
  });
});
