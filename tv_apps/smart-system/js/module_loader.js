'use strict';
/* global Activities */

(function(exports) {

  /**
   * Handles relaying of information for web activities.
   * Contains code to display the list of valid activities,
   * and fires an event off when the user selects one.
   * @class ModuleLoader
   */
  function ModuleLoader() {
    window.addEventListener('mozChromeEvent', this);
  }

  ModuleLoader.prototype = {
    chromeEventHandlers: {
      'activity-choice': [{
        'file': '/js/activities.js',
        'className': 'Activities'
      }]
    },
    /** @lends ModuleLoader */

    /**
    * General event handler interface.
    * Updates the overlay with as we receive load events.
    * @memberof Activities.prototype
    * @param {DOMEvent} evt The event.
    */
    handleEvent: function(evt) {
      switch (evt.type) {
        case 'mozChromeEvent':
          this.handleChromeEvent(evt);
          break;
      }
    },

    handleChromeEvent: function(evt) {
      var detail = evt.detail;
      // we don't have such kind of handler, exit the function.
      if (!this.chromeEventHandlers[detail.type]) {
        return;
      }

      this.chromeEventHandlers[detail.type].forEach(function(handler) {
        if (!handler.instance) {
          LazyLoader.load(handler.file, function() {
            handler.instance = new exports[handler.className]();
            handler.instance.handleEvent(evt);
          }); 
        } else {
          handler.instance.handleEvent(evt);
        }
      });
    }
  };

  exports.ModuleLoader = ModuleLoader;

}(window));
