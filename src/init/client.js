ActiveResource.Interfaces.JsonApi.contentType = 'application/json';

class Occasion {
  static baseUrl = 'https://occ.sn/api/v1';

  static Client(options = {}) {
    var url = options.baseUrl || Occasion.baseUrl;
    var host = url.match(/\w+:\/\/[^\/]+/);

    var atlas = document.createElement("script");
    atlas.type = "text/javascript";
    atlas.async = true;
    atlas.src = `${host}/p/tracker.js`;
    document.getElementsByTagName('head')[0].appendChild(atlas);

    var token = options.token;
    var immutable = options.immutable || false;

    if(!_.isString(token)) {
      throw 'Token must be of type string';
    }

    var encodedToken = window.btoa(unescape(encodeURIComponent(token + ':')));

    var libraryOptions = {
      headers: {
        Authorization: "Basic " + encodedToken
      },
      immutable
    };

    var resourceLibrary =
      ActiveResource.createResourceLibrary(url, libraryOptions);

    Occasion.Modules.each(function(initializeModule) { initializeModule(resourceLibrary) });

    return resourceLibrary;
  }
}
