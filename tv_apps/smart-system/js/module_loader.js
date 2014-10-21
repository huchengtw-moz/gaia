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
    handlers: {
      'activities': {
        'file': '/js/activities.js',
        'className': 'Activities'
      }
    },
    /**
     * handles for mozChromeEvent
     */
    chromeEventHandlers: {
      'activity-choice': ['activities']
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

      this.chromeEventHandlers[detail.type].forEach(function(name) {
        var handler = self.handlers[name];
        if (!handler.instance) {
          LazyLoader.load(handler.file, function() {
            handler.instance = new exports[handler.className]();
            if ((typeof handler.instance['start']) === 'function') {
              handler.instance.start();
            }
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
