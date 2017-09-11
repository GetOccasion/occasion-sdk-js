class Occasion {
  static baseUrl = 'https://app.getoccasion.com/api/v1';

  static Client(token) {
    var encodedToken = window.btoa(unescape(encodeURIComponent(token + ':')));

    var resourceLibrary =
      ActiveResource.createResourceLibrary(Occasion.baseUrl, {
        headers: {
          Authorization: "Basic " + encodedToken
        }
      });

    Occasion.Modules.each(function(initializeModule) { initializeModule(resourceLibrary) });

    return resourceLibrary;
  }
}