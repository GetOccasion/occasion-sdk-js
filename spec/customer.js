describe('Occasion.Customer', function() {
  beforeEach(function() {
    this.occsnClient = Occasion.Client({ token: 'my_token' })

    moxios.install(this.occsnClient.interface.axios)

    window.onSuccess = jasmine.createSpy('onSuccess')
    window.onFailure = jasmine.createSpy('onFailure')
    window.onCompletion = jasmine.createSpy('onCompletion')
  })

  afterEach(function() {
    moxios.uninstall()
  })

  describe('complete', function() {
    describe('value null', function() {
      beforeEach(function() {
        this.customer = this.occsnClient.Customer.build({
          email: null,
          firstName: null,
          lastName: null
        })
      })

      it('returns false', function() {
        expect(this.customer.complete()).toBeFalsy()
      })
    })

    describe('value blank', function() {
      beforeEach(function() {
        this.customer = this.occsnClient.Customer.build({
          email: 'email@example.com',
          firstName: '',
          lastName: 'S'
        })
      })

      it('returns false', function() {
        expect(this.customer.complete()).toBeFalsy()
      })
    })

    describe('values complete', function() {
      beforeEach(function() {
        this.customer = this.occsnClient.Customer.build({
          email: 'email@example.com',
          firstName: 'J',
          lastName: 'S'
        })
      })

      it('returns true', function() {
        expect(this.customer.complete()).toBeTruthy()
      })
    })
  })
})
