var OccasionSDKSpecs = {};

describe('Occasion.Client', function() {
  beforeEach(function() {
    jasmine.Ajax.install();

    window.onSuccess = jasmine.createSpy('onSuccess');
    window.onFailure = jasmine.createSpy('onFailure');
    window.onCompletion = jasmine.createSpy('onCompletion');

    this.occsnClient = Occasion.Client('my_token');
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('adds resource classes on initialization', function() {
    expect(_.keys(this.occsnClient)).toContain('Product', 'Answer', 'Question', 'Order');
  });

  describe('when making requests', function() {
    beforeEach(function() {
      this.occsnClient.Product.all()
      .done(window.onSuccess);
    });

    it('makes request to base Occasion API URL', function() {
      expect(jasmine.Ajax.requests.mostRecent().url.indexOf(Occasion.baseUrl)).toEqual(0);
    });

    it('adds token to Authorization header', function() {
      var encodedToken = window.btoa(unescape(encodeURIComponent('my_token:')));

      expect(jasmine.Ajax.requests.mostRecent().requestHeaders['Authorization']).toEqual('Basic ' + encodedToken);
    });

    it('adds OccasionSDK User-Agent header', function() {
      expect(jasmine.Ajax.requests.mostRecent().requestHeaders['User-Agent']).toEqual('OccasionSDK');
    });
  });
});