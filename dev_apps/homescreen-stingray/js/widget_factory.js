/* global BrowserConfigHelper, WidgetWindow, Applications, WidgetAPITester */
'use strict';

(function(exports) {
  /**
   * WidgetFactory creates widget window by arguments supplied.
   * @class WidgetFactory
   */
  var WidgetFactory = function() {
  };

  WidgetFactory.prototype = {
    /** @lends WidgetFactory */

    /**
     * Add a widget window and put it into management.
     * @memberOf WidgetFactory
     * @fires WidgetFactory#launchwidget
     * @param {Object} args - Arguments for creating widget.
     * @param {String} args.app.manifestURL - manifest URL for widget
     * @param {String} args.app.id - widget id
     * @param {integer} args.rect.left - left position of widget
     * @param {integer} args.rect.top - top position of widget
     * @param {integer} args.rect.width - width of widget
     * @param {integer} args.rect.height - height of widget
     */
    createWidget: function(args) {
      var manifestURL = args.app.manifestURL;
      var origin = manifestURL.split('/').slice(0,3).join('/');

      var widget = Applications.getWidgetEntry(args.app.manifestURL,
                                               args.app.id);
      if (!widget) {
        return null;
      }

      var appURL = origin + widget.launchPath;

      var config = new BrowserConfigHelper(appURL, manifestURL, origin);
      var widgetOverlay = document.getElementById('widget-container');
      var app = new WidgetWindow(config, widgetOverlay);
      // XXX: Separate styles.
      app.setStyle(args.rect);
      /**
       * fired when widget is being created and launched.
       * @event WidgetFactory#launchwidget
       */
      this.publish('launchwidget', app.instanceID);
      WidgetAPITester.watchEvents(app);
      return app;
    },

    publish: function wf_publish(event, detail) {
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, true, false, detail);
      window.dispatchEvent(evt);
    }
  };

  exports.WidgetFactory = WidgetFactory;
}(window));

