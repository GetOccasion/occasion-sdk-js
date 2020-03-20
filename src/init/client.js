ActiveResource.Interfaces.JsonApi.contentType = 'application/json'

class Occasion {
  static baseUrl = 'https://occ.sn/api/v1'

  static Client(options = {}) {
    var url = options.baseUrl || Occasion.baseUrl
    var token = options.token
    var secret = options.secret
    var immutable = options.immutable || false

    if (!_.isString(token)) {
      throw 'Token must be of type string'
    }

    // Support NodeJs
    if (typeof window === 'undefined') {
      var encodedToken = Buffer.from(
        unescape(encodeURIComponent([token, secret].join(':')))
      ).toString('base64')
    } else {
      var encodedToken = window.btoa(unescape(encodeURIComponent([token, secret].join(':'))))
    }

    var libraryOptions = {
      headers: {
        Authorization: 'Basic ' + encodedToken
      },
      immutable,
      strictAttributes: true
    }

    var resourceLibrary = ActiveResource.createResourceLibrary(url, libraryOptions)

    Occasion.Modules.each(function(initializeModule) {
      initializeModule(resourceLibrary)
    })

    return resourceLibrary
  }
}
