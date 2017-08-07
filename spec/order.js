var OccasionSDKSpecs = {};

describe('Occasion.Order', function() {
  beforeEach(function() {
    jasmine.Ajax.install();

    window.onSuccess = jasmine.createSpy('onSuccess');
    window.onFailure = jasmine.createSpy('onFailure');
    window.onCompletion = jasmine.createSpy('onCompletion');

    this.occsnClient = Occasion.Client('my_token');

    this.order = this.occsnClient.Order.build();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  describe('charge', function() {
    beforeEach(function() {
      this.paymentMethod = this.occsnClient.CreditCard.build({ id: 'cc_token' });
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
      this.paymentMethod = this.occsnClient.CreditCard.build({ id: 'cc_token' });
      this.order.charge(this.paymentMethod, 10.0);

      this.order.editCharge(this.paymentMethod, 1000.0)
    });

    it('changes payment method\'s transaction amount', function() {
      expect(this.order.transactions().target().first().amount).toEqual(1000.0);
    });
  });
});