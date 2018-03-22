var OccasionSDKSpecs = {};

describe('Occasion.Order', function() {
  beforeEach(function() {
    moxios.install();

    window.onSuccess = jasmine.createSpy('onSuccess');
    window.onFailure = jasmine.createSpy('onFailure');
    window.onCompletion = jasmine.createSpy('onCompletion');

    this.occsnClient = Occasion.Client({ token: 'my_token' });
  });

  afterEach(function() {
    moxios.uninstall();
  });

  describe('calculatePrice', function () {
    beforeEach(function () {
      this.order = this.occsnClient.Order.build();

      this.order.calculatePrice();

      this.promise = moxios.wait(function() {
        return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.price);
      });
    });

    it('adds price attributes to order', function () {
      var _this = this;
      return this.promise.then(function() {

        expect(_this.order.attributes()).toEqual({
          subtotal: 3.0,
          couponAmount: 2.0,
          tax: 1.0,
          giftCardAmount: 1.0,
          price: 2.0,
          outstandingBalance: 1.0
        })
      });
    });
  });

  describe('retrieveInformation', function () {
    beforeEach(function () {
      this.order = this.occsnClient.Order.build();

      this.order.retrieveInformation();

      this.promise = moxios.wait(function() {
        return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.information);
      });
    });

    it('adds price + quantity attributes to order', function () {
      var _this = this;
      return this.promise.then(function() {

        expect(_this.order.attributes()).toEqual({
          subtotal: 3.0,
          couponAmount: 2.0,
          tax: 1.0,
          giftCardAmount: 1.0,
          price: 2.0,
          outstandingBalance: 1.0,
          quantity: 2
        })
      });
    });
  });

  describe('construct', function() {
    beforeEach(function () {
      this.occsnClient.Product.find('1kbsdf')
      .then(window.onSuccess);

      var _this = this;
      this.promise = moxios.wait(function() {
        return moxios.requests.mostRecent().respondWith(JsonApiResponses.Product.find.success)
        .then(function() {
          _this.product = window.onSuccess.calls.mostRecent().args[0];
        });
      });

      this.promise2 = this.promise.then(function() {
        _this.occsnClient.Order.construct({ product: _this.product })
        .then(window.onSuccess);

        return moxios.wait(function() {
          return moxios.requests.mostRecent().respondWith(JsonApiResponses.Question.all.success)
          .then(function() {
            _this.order = window.onSuccess.calls.mostRecent().args[0];
          });
        });
      });
    });

    it('assigns a session identifier', function() {
      var _this = this;
      return this.promise2.then(function() {
        expect(_this.order.sessionIdentifier.length).not.toEqual(0);
      });
    });

    it('builds a customer', function() {
      var _this = this;
      return this.promise2.then(function() {
        expect(_this.order.customer().attributes()).toEqual({
          email: null,
          firstName: null,
          lastName: null,
          zip: null
        });
      });
    });

    it('loads product questions', function() {
      return this.promise2.then(function() {
        expect(moxios.requests.mostRecent().url).toEqual(
          encodeURI('https://example.com/api/v1/products/1/questions/?include=options&page[size]=500')
        );
      });
    });

    it('populates blank answers for each question', function() {
      var _this = this;
      return this.promise2.then(function() {
        var questionIds = _this.order.answers().target().map(function(t) { return t.question().id }).toArray();

        expect(questionIds).toEqual(["1", "2"]);
      });
    });

    describe('when product blank', function() {
      beforeEach(function(){
        this.occsnClient.Order.construct()
        .then(window.onCompletion);

        var _this = this;
        this.promise3 = moxios.wait(function() {
          return moxios.requests.mostRecent().respondWith(JsonApiResponses.Question.all.success)
          .then(function() {
            _this.order = window.onCompletion.calls.mostRecent().args[0];
          });
        });
      });

      it('still builds order', function() {
        var _this = this;
        return this.promise3.then(function() {
          expect(_this.order.isA(_this.occsnClient.Order)).toBeTruthy();
        });
      });
    });
  });

  describe('transactions', function() {
    beforeEach(function() {
      this.order = this.occsnClient.Order.build();
      this.paymentMethod = this.occsnClient.CreditCard.build({ id: 'cc_token' });
    });

    describe('charge', function() {
      beforeEach(function() {
        this.order.charge(this.paymentMethod, 10.0);
      });

      it('adds transaction', function() {
        expect(this.order.transactions().size()).toEqual(1);
      });

      it('adds amount to transaction', function() {
        expect(this.order.transactions().target().first().amount).toEqual(10.0);
      });

      it('adds paymentMethod transaction', function() {
        expect(this.order.transactions().target().first().paymentMethod()).toEqual(this.paymentMethod);
      });
    });

    describe('editCharge', function() {
      beforeEach(function() {
        this.order.charge(this.paymentMethod, 10.0);

        this.order.editCharge(this.paymentMethod, 1000.0);
      });

      it('changes payment method\'s transaction amount', function() {
        expect(this.order.transactions().target().first().amount).toEqual(1000.0);
      });
    });

    describe('removeCharge', function() {
      beforeEach(function() {
        this.order.charge(this.paymentMethod, 10.0);

        this.order.removeCharge(this.paymentMethod);
      });

      it('removes the charge', function() {
        expect(this.order.transactions().empty()).toBeTruthy();
      });
    });
  });
});
