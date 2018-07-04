describe('Occasion.Order', function() {
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

  describe('attendees / quantity matching', function () {
    beforeEach(function () {
      this.occsnClient.Product.find('1kbsdf')
      .then(window.onSuccess);

      this.promise = moxios.wait(() => {
        return moxios.requests.mostRecent().respondWith(JsonApiResponses.Product.attendees)
        .then(() => {
          this.product = window.onSuccess.calls.mostRecent().args[0];
        });
      });

      this.promise2 = this.promise.then(() => {
        this.occsnClient.Order.create({ product: this.product }).then(window.onSuccess);

        return moxios.wait(() => {
          return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.attendees)
          .then(() => {
            this.order = window.onSuccess.calls.mostRecent().args[0];
          });
        });
      });
    });

    it('builds attendees to match size to quantity', function () {
      return this.promise2.then(() => {
        expect(this.order.attendees().size()).toEqual(2);
      });
    });

    describe('lowering quantity', () => {
      beforeEach(function() {
        this.promise3 = this.promise2.then(() => {
          this.order.save().then(window.onSuccess);

          return moxios.wait(() => {
            return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.no_attendees)
            .then(() => {
              this.order = window.onSuccess.calls.mostRecent().args[0];
            });
          });
        });
      });

      it('pops attendees to match size to quantity', function () {
        return this.promise3.then(() => {
          expect(this.order.attendees().size()).toEqual(0);
        });
      });
    });
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
        expect(_.keys(_this.order)).toContain(
          'subtotal',
          'couponAmount',
          'tax',
          'giftCardAmount',
          'price',
          'outstandingBalance'
        );
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

        expect(_.keys(_this.order)).toContain(
          'subtotal',
          'couponAmount',
          'tax',
          'giftCardAmount',
          'price',
          'outstandingBalance',
          'quantity'
        );
      });
    });
  });

  describe('construct', function() {
    describe('when product requires time slot selection', function() {
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

          expect(questionIds).toEqual(["1", "2", "3", "4"]);
        });
      });

      it('populates answer.option with default option for drop_down', function() {
        var _this = this;
        return this.promise2.then(function() {
          var answer =
            _this.order.answers().target()
            .detect(function(t) { return t.question().formControl == 'drop_down' });

          expect(answer.option().default).toEqual(true);
        });
      });

      it('populates answer.option with default option for option_list', function() {
        var _this = this;
        return this.promise2.then(function() {
          var answer =
            _this.order.answers().target()
            .detect(function(t) { return t.question().formControl == 'option_list' });

          expect(answer.option().default).toEqual(true);
        });
      });

      it('populates answer.value with min for spin_button', function() {
        var _this = this;
        return this.promise2.then(function() {
          var answer =
            _this.order.answers().target()
            .detect(function(t) { return t.question().formControl == 'spin_button' });

          expect(answer.value).toEqual(1);
        });
      });
    });

    describe('when product does not require time slot selection', function() {
      describe('when timeSlots.size == 1', function() {
        beforeEach(function () {
          this.occsnClient.Product.find('1kbsdf')
          .then(window.onSuccess);

          this.promise = moxios.wait(() => {
            return moxios.requests.mostRecent().respondWith(JsonApiResponses.Product.one_time_slot)
            .then(() => {
              this.product = window.onSuccess.calls.mostRecent().args[0];
            });
          });

          moxios.stubRequest(/.+\/questions.*/, JsonApiResponses.Question.all.success);
          moxios.stubRequest(/.+\/time_slots.*/, JsonApiResponses.TimeSlot.single);

          this.promise2 = this.promise.then(() => {
            this.occsnClient.Order.construct({ product: this.product })
            .then(window.onSuccess);

            return moxios.wait(() => {
              this.order = window.onSuccess.calls.mostRecent().args[0];
            });
          });
        });

        it('assigns order.timeSlots to the only product timeSlot', function() {
          return this.promise2.then(() => {
            expect(this.order.timeSlots().size()).toEqual(1);
          });
        });
      });

      describe('when sellsSessions', function() {
        beforeEach(function () {
          this.occsnClient.Product.find('1kbsdf')
          .then(window.onSuccess);

          this.promise = moxios.wait(() => {
            return moxios.requests.mostRecent().respondWith(JsonApiResponses.Product.session)
            .then(() => {
              this.product = window.onSuccess.calls.mostRecent().args[0];
            });
          });

          moxios.stubRequest(/.+\/questions.*/, JsonApiResponses.Question.all.success);
          moxios.stubRequest(/.+\/time_slots.*/, JsonApiResponses.TimeSlot.index);

          this.promise2 = this.promise.then(() => {
            this.occsnClient.Order.construct({ product: this.product })
            .then(window.onSuccess);

            return moxios.wait(() => {
              this.order = window.onSuccess.calls.mostRecent().args[0];
            });
          });
        });

        it('assigns order.timeSlots to all product timeSlots', function() {
          return this.promise2.then(() => {
            expect(this.order.timeSlots().size()).toEqual(10);
          });
        });
      });
    });

    describe('when product blank', function() {
      beforeEach(function(){
        this.occsnClient.Order.construct()
        .then(window.onCompletion);

        this.promise3 = moxios.wait(() => {
          this.order = window.onCompletion.calls.mostRecent().args[0];
        });
      });

      it('still builds order', function() {
        return this.promise3.then(() => {
          expect(this.order.isA(this.occsnClient.Order)).toBeTruthy();
        });
      });
    });
  });

  describe('decimal attributes', function() {
    beforeEach(function() {
      this.occsnClient.Order.create()
      .then(window.onCompletion);

      this.promise = moxios.wait(() => {
        return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.price)
        .then(() => {
          this.order = window.onCompletion.calls.mostRecent().args[0];
        });
      })
    });

    it('wraps subtotal in Decimal', function() {
      return this.promise.then(() => {
        expect(this.order.subtotal.toFixed).toBeDefined();
      });
    });

    it('wraps couponAmount in Decimal', function() {
      return this.promise.then(() => {
        expect(this.order.couponAmount.toFixed).toBeDefined();
      });
    });

    it('wraps tax in Decimal', function() {
      return this.promise.then(() => {
        expect(this.order.tax.toFixed).toBeDefined();
      });
    });

    it('wraps giftCardAmount in Decimal', function() {
      return this.promise.then(() => {
        expect(this.order.giftCardAmount.toFixed).toBeDefined();
      });
    });

    it('wraps price in Decimal', function() {
      return this.promise.then(() => {
        expect(this.order.price.toFixed).toBeDefined();
      });
    });

    it('wraps outstandingBalance in Decimal', function() {
      return this.promise.then(() => {
        expect(this.order.outstandingBalance.toFixed).toBeDefined();
      });
    });
  });

  describe('transactions', function() {
    describe('charging', function() {
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

    describe('changing outstandingBalance', function() {
      beforeEach(function() {
        this.occsnClient.Product.find('1kbsdf')
        .then(window.onSuccess);

        this.promise = moxios.wait(() => {
          return moxios.requests.mostRecent().respondWith(JsonApiResponses.Product.find.success)
          .then(() => {
            this.product = window.onSuccess.calls.mostRecent().args[0];
          });
        });
      });

      describe('one gift card', function() {
        beforeEach(function() {
          this.promise2 = this.promise.then(() => {
            this.occsnClient.Order.create({ product: this.product }).then(window.onSuccess);

            return moxios.wait(() => {
              return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.gift_cards)
              .then(() => {
                this.order = window.onSuccess.calls.mostRecent().args[0];
              });
            });
          });
        });

        describe('raising balance', function() {
          describe('sufficient gift card value', function() {
            beforeEach(function() {
              this.promise3 = this.promise2.then(() => {
                this.order.charge(this.occsnClient.GiftCard.build({ id: '1', value: 3.0 }), '2.0');
                this.order.charge(this.occsnClient.CreditCard.build({ id: 'cc_token' }), '0.0');

                this.order.save().then(window.onSuccess);

                return moxios.wait(() => {
                  return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.higher_price)
                  .then(() => {
                    this.order = window.onSuccess.calls.mostRecent().args[0];
                  });
                });
              });
            });

            it('charges gift card more', function() {
              return this.promise3.then(() => {
                expect(this.order.transactions().target().first().amount).toEqual('3');
              });
            });

            it('does not charge credit card more', function() {
              return this.promise3.then(() => {
                expect(this.order.transactions().target().last().amount).toEqual('0');
              });
            });
          });

          describe('insufficient gift card value', function() {
            beforeEach(function() {
              this.promise3 = this.promise2.then(() => {
                this.order.charge(this.occsnClient.GiftCard.build({ id: '1', value: 2.0 }), '2');
                this.order.charge(this.occsnClient.CreditCard.build({ id: 'cc_token' }), '0');

                this.order.save().then(window.onSuccess);

                return moxios.wait(() => {
                  return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.higher_price)
                  .then(() => {
                    this.order = window.onSuccess.calls.mostRecent().args[0];
                  });
                });
              });
            });

            it('does not charge gift card more', function() {
              return this.promise3.then(() => {
                expect(this.order.transactions().target().first().amount).toEqual('2');
              });
            });

            it('charges credit card more', function() {
              return this.promise3.then(() => {
                expect(this.order.transactions().target().last().amount).toEqual('1');
              });
            });
          });
        });

        describe('lowering balance', function() {
          beforeEach(function() {
            this.promise3 = this.promise2.then(() => {
              this.order.charge(this.occsnClient.GiftCard.build({ id: '1', value: 3.0 }), '2');
              this.order.charge(this.occsnClient.CreditCard.build({ id: 'cc_token' }), '0');

              this.order.save().then(window.onSuccess);

              return moxios.wait(() => {
                return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.lower_price)
                .then(() => {
                  this.order = window.onSuccess.calls.mostRecent().args[0];
                });
              });
            });
          });

          it('charges gift card less', function() {
            return this.promise3.then(() => {
              expect(this.order.transactions().target().first().amount).toEqual('0');
            });
          });
        });
      });

      describe('two gift cards', function() {
        beforeEach(function() {
          this.promise2 = this.promise.then(() => {
            this.occsnClient.Order.create({ product: this.product }).then(window.onSuccess);

            return moxios.wait(() => {
              return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.gift_cards)
              .then(() => {
                this.order = window.onSuccess.calls.mostRecent().args[0];
              });
            });
          });
        });

        describe('raising balance', function() {
          describe('sufficient gift card value', function() {
            beforeEach(function() {
              this.promise3 = this.promise2.then(() => {
                this.order.charge(this.occsnClient.GiftCard.build({ id: '1', value: 1.0 }), '1');
                this.order.charge(this.occsnClient.GiftCard.build({ id: '2', value: 2.0 }), '1');
                this.order.charge(this.occsnClient.CreditCard.build({ id: 'cc_token' }), '0');

                this.order.save().then(window.onSuccess);

                return moxios.wait(() => {
                  return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.higher_price)
                  .then(() => {
                    this.order = window.onSuccess.calls.mostRecent().args[0];
                  });
                });
              });
            });

            it('charges last gift card more', function() {
              return this.promise3.then(() => {
                expect(this.order.transactions().target().get(1).amount).toEqual('2');
              });
            });

            it('does not charge credit card more', function() {
              return this.promise3.then(() => {
                expect(this.order.transactions().target().last().amount).toEqual('0');
              });
            });
          });

          describe('insufficient gift card value', function() {
            beforeEach(function() {
              this.promise3 = this.promise2.then(() => {
                this.order.charge(this.occsnClient.GiftCard.build({ id: '1', value: 1.0 }), '1');
                this.order.charge(this.occsnClient.GiftCard.build({ id: '2', value: 1.0 }), '1');
                this.order.charge(this.occsnClient.CreditCard.build({ id: 'cc_token' }), '0');

                this.order.save().then(window.onSuccess);

                return moxios.wait(() => {
                  return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.higher_price)
                  .then(() => {
                    this.order = window.onSuccess.calls.mostRecent().args[0];
                  });
                });
              });
            });

            it('does not charge gift card more', function() {
              return this.promise3.then(() => {
                expect(this.order.transactions().target().get(1).amount).toEqual('1');
              });
            });

            it('charges credit card more', function() {
              return this.promise3.then(() => {
                expect(this.order.transactions().target().last().amount).toEqual('1');
              });
            });
          });
        });

        describe('lowering balance', function() {
          beforeEach(function() {
            this.promise3 = this.promise2.then(() => {
              this.order.charge(this.occsnClient.GiftCard.build({ id: '1', value: 1.0 }), '1');
              this.order.charge(this.occsnClient.GiftCard.build({ id: '2', value: 1.0 }), '1');
              this.order.charge(this.occsnClient.CreditCard.build({ id: 'cc_token' }), '0');

              this.order.save().then(window.onSuccess);

              return moxios.wait(() => {
                return moxios.requests.mostRecent().respondWith(JsonApiResponses.Order.lower_price)
                .then(() => {
                  this.order = window.onSuccess.calls.mostRecent().args[0];
                });
              });
            });
          });

          it('charges gift cards less', function() {
            return this.promise3.then(() => {
              expect(this.order.transactions().target().get(0).amount).toEqual('0');
              expect(this.order.transactions().target().get(1).amount).toEqual('0');
            });
          });

          it('does not charge credit card more', function() {
            return this.promise3.then(() => {
              expect(this.order.transactions().target().last().amount).toEqual('0');
            });
          });
        });
      });
    });
  });
});
