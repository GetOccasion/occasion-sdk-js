describe('Occasion.Attendee', function() {
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
    beforeEach(function() {
      moxios.stubRequest(/.+\/products\/1kbsdf.*/, JsonApiResponses.Product.attendees)

      this.occsnClient.Product.find('1kbsdf').then(window.onSuccess)

      this.promise = moxios.wait(() => {
        this.product = window.onSuccess.calls.mostRecent().args[0]

        this.order = this.occsnClient.Order.build({
          product: this.product
        })
      })
    })

    describe('value null', function() {
      beforeEach(function() {
        this.promise2 = this.promise.then(() => {
          this.attendee = this.order.attendees().build({
            firstName: null,
            lastName: null
          })
        })
      })

      it('returns false', function() {
        return this.promise2.then(() => {
          expect(this.attendee.complete()).toBeFalsy()
        })
      })
    })

    describe('value blank', function() {
      beforeEach(function() {
        this.promise2 = this.promise.then(() => {
          this.attendee = this.order.attendees().build({
            firstName: 'J',
            lastName: ''
          })
        })
      })

      it('returns false', function() {
        return this.promise2.then(() => {
          expect(this.attendee.complete()).toBeFalsy()
        })
      })
    })

    describe('values complete', function() {
      beforeEach(function() {
        this.promise2 = this.promise.then(() => {
          this.attendee = this.order.attendees().build({
            firstName: 'J',
            lastName: 'S'
          })
        })
      })

      it('returns true', function() {
        return this.promise2.then(() => {
          expect(this.attendee.complete()).toBeTruthy()
        })
      })
    })
  })
})
