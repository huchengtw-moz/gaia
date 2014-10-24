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
    for(var k in this.customEventHandlers) {
      window.addEventListener(k, this);
    }
  }

  ModuleLoader.prototype = {
    handlers: {
      'activities': {
        'file': '/js/activities.js',
        'className': 'Activities',
        'exportToWindow': 'activities'
      },
      'externalStorageMonitor': {
        'file': '/js/external_storage_monitor.js',
        'className': 'ExternalStorageMonitor',
        'exportToWindow': 'externalStorageMonitor',
        'onlyLazyLoad': true
      },
      'hardwareButtons': {
        'file': '/js/hardware_buttons.js',
        'className': 'HardwareButtons'
      }
    },

    /**
     * handles for mozChromeEvent
     */
    chromeEventHandlers: {
      'activity-choice': ['activities'],
      'home-button-press': ['hardwareButtons'],
      'home-button-release': ['hardwareButtons'],
      'sleep-button-press': ['hardwareButtons'],
      'sleep-button-release': ['hardwareButtons'],
      'volume-up-button-press': ['hardwareButtons'],
      'volume-up-button-release': ['hardwareButtons'],
      'volume-down-button-press': ['hardwareButtons'],
      'volume-down-button-release': ['hardwareButtons']
    },

    /**
     * handles for CustomEvent
     */
    customEventHandlers: {
      'homescreenopened': ['externalStorageMonitor']
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
        default:
          this.handleCustomEvent(evt);
          break;
      }
    },

    handleChromeEvent: function(evt) {
      var detail = evt.detail;
      // we don't have such kind of handler, exit the function.
      if (!this.chromeEventHandlers[detail.type]) {
        return;
      }
      this.pipeToHandlers(this.chromeEventHandlers[detail.type], evt);
    },

    handleCustomEvent: function(evt) {
      if (!this.customEventHandlers[evt.type]) {
        return;
      }
      this.pipeToHandlers(this.customEventHandlers[evt.type], evt);
    },

    pipeToHandlers: function(handlers, evt) {
      var self = this;
      handlers.forEach(function(name) {
        var handler = self.handlers[name];
        if (!handler.instance) {
          LazyLoader.load(handler.file, function() {
            handler.instance = new exports[handler.className]();
            if ((typeof handler.instance['start']) === 'function') {
              handler.instance.start();
            }
            // export to window for backward compatible.
            if (handler.exportToWindow) {
              window[handler.exportToWindow] = handler.instance;
            }
            // If handler has handleEvent, we need to pipe event to it.
            // Otherwise, we just lazy load the module.
            if (!handler.onlyLazyLoad &&
                (typeof handler.instance['handleEvent']) === 'function') {
              handler.instance.handleEvent(evt);
            }
          }); 
        } else if ((typeof handler.instance['handleEvent']) === 'function') {
          handler.instance.handleEvent(evt);
        }
      });
    }
  };

  exports.ModuleLoader = ModuleLoader;

}(window));
