var OccasionSDKSpecs = {};

describe('Occasion.Client', function() {
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

  it('adds resource classes on initialization', function() {
    expect(_.keys(this.occsnClient)).toContain('Product', 'Answer', 'Question', 'Order');
  });

  it('is not immutable', function() {
    this.resource = this.occsnClient.Product.build({ field: 'original' });
    this.resource.assignAttributes({ field: 'new' });
    expect(this.resource.field).toEqual('new');
  });

  describe('when token not of type string', function() {
    it('throws error', function() {
      expect(function() { Occasion.Client() }).toThrow('Token must be of type string');
    });
  });

  describe('when making requests', function() {
    beforeEach(function() {
      this.occsnClient.Product.all()
      .then(window.onSuccess);
    });

    it('makes request to default base Occasion API URL', function() {
      expect(moxios.requests.mostRecent().url.indexOf(Occasion.baseUrl)).toEqual(0);
    });

    it('adds token to Authorization header', function() {
      var encodedToken = window.btoa(unescape(encodeURIComponent('my_token:')));

      expect(moxios.requests.mostRecent().headers['Authorization']).toEqual('Basic ' + encodedToken);
    });
  });

  describe('override baseUrl', function() {
    beforeEach(function() {
      this.occsnClient = Occasion.Client({ baseUrl: 'http://occasion.lvh.me:3000/', token: 'my_token' });
      moxios.install(this.occsnClient.interface.axios);
    });

    describe('when making requests', function() {
      beforeEach(function() {
        this.occsnClient.Product.all()
        .then(window.onSuccess);
      });

      it('makes request to baseURL', function() {
        expect(moxios.requests.mostRecent().url.indexOf('http://occasion.lvh.me:3000/')).toEqual(0);
      });
    });
  });

  describe('immutable', function() {
    beforeEach(function() {
      this.occsnClient = Occasion.Client({ immutable: true, token: 'my_token' });
    });

    describe('when changing resource', function() {
      beforeEach(function() {
        this.resource = this.occsnClient.Product.build({ field: 'original' });
        this.resource2 = this.resource.assignAttributes({ field: 'new' });
      });

      it('does not mutate resource', function() {
        expect(this.resource.field).toEqual('original');
      });

      it('creates new resource', function() {
        expect(this.resource).not.toBe(this.resource2);
      });

      it('adds changes to new resource', function() {
        expect(this.resource2.field).toEqual('new');
      });
    });
  });
});
