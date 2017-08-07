class Occasion {
  static Client(token) {
    var resourceLibrary =
      ActiveResource.createResourceLibrary('https://app.getoccasion.com/api/v1', {
        headers: {
          Authorization: "Basic #{window.btoa(unescape(encodeURIComponent('" + token + ":')))}",
          'User-Agent': 'OccasionSDK'
        }
      });

    Occasion.Modules.each(function(initializeModule) { initializeModule(resourceLibrary) });

    return resourceLibrary;
  }
}