'use strict';

(function(window) {
  var isOutOfProcessDisabled = false;
  /**
   * This class generates browser configuration object
   * from manifestURL or src provided.
   *
   * The configuration object is used for BrowserFrame generation.
   *
   * * If manifestURL is provided, we would treat it as a web app,
   *   and then use Applications to fetch the remaining info we need
   *   to construct the options for mozbrowser iframe.
   *
   * * If only URL is provided, we would treat it as a web page.
   *
   * The returned configuration object contains:
   *
   * * Origin: the same as appURL.
   * * manifestURL: the same as manifestURL.
   *
   * * manifest: the parsed manifest object.
   *             If the app is not an entry point app,
   *             the manifest would be the reference of application manifest
   *             stored in Applications module.
   *             But if the app is an entry point app,
   *             we will do deep clone to generate a new object and
   *             replace the properties of entry point to proper position.
   *
   * * name: the name of the app, retrieved from manifest.
   *
   * * oop: indicate it's running out of process or in process.
   *
   * @param {String} appURL The URL of the app or the page to be opened.
   * @param {String} [manifestURL] The manifest URL of the app.
   *
   * @class BrowserConfigHelper
   */
  window.BrowserConfigHelper = function(appURL, manifestURL, origin) {
    var manifest = Applications.getEntryManifest(manifestURL);
    if (!manifest) {
      this.name = '';
      this.origin = appURL;
      this.manifestURL = '';
      this.manifest = null;
      return;
    }
    this.url = appURL;
    var name = new ManifestHelper(manifest).name;

    // These apps currently have bugs preventing them from being
    // run out of process. All other apps will be run OOP.
    var host = document.location.host;
    var domain = host.replace(/(^[\w\d]+\.)?([\w\d]+\.[a-z]+)/, '$2');
    var protocol = document.location.protocol + '//';
    var browserManifestUrl =
      protocol + 'browser.' + domain + '/manifest.webapp';
    var outOfProcessBlackList = [
      browserManifestUrl
      // Requires nested content processes (bug 761935).  This is not
      // on the schedule for v1.
    ];

    if (!isOutOfProcessDisabled &&
        outOfProcessBlackList.indexOf(manifestURL) === -1) {
      // FIXME: content shouldn't control this directly
      this.oop = true;
    }

    this.name = name;
    this.manifestURL = manifestURL;
    this.origin = origin;
    this.manifest = manifest;
  };
})(this);
