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
      },
      'mediaRecording': {
        'file': '/js/media_recording.js',
        'className': 'MediaRecording'
      },
      'permissionManager': {
        'file': [document.getElementById('permission-screen'),// lazy load DOM
                 '/style/permission_manager/permission_manager.css',
                 '/js/permission_manager.js'],
        'className': 'PermissionManager',
        'exportToWindow': 'permissionManager'
      },
      'remoteDebugger': {
        'file': '/js/remote_debugger.js',
        'className': 'RemoteDebugger',
        'exportToWindow': 'remoteDebugger'
      },
      'screenshot': {
        'file': '/js/screenshot.js',
        'className': 'Screenshot',
        'exportToWindow': 'screenshot'
      },
      'sleepMenu': {
        'file': [document.getElementById('sleep-menu'),// lazy load DOM
                 '/style/sleep_menu/sleep_menu.css',
                 '/js/sleep_menu.js'],
        'className': 'SleepMenu',
        'exportToWindow': 'sleepMenu'
      },
      'suspendingAppPriorityManager': {
        'file': 'suspending_app_priority_manager.js',
        'className': 'SuspendingAppPriorityManager'
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
      'volume-down-button-release': ['hardwareButtons'],
      'recording-status': ['mediaRecording'],
      'permission-prompt': ['permissionManager'],
      'cancel-permission-prompt': ['permissionManager'],
      'fullscreenoriginchange': ['permissionManager'],
      'remote-debugger-prompt': ['remoteDebugger']
    },

    /**
     * handles for CustomEvent
     */
    customEventHandlers: {
      'homescreenopened': ['externalStorageMonitor'],
      'volumedown+sleep': ['screenshot'],
      'holdsleep': ['sleepMenu'],
      'batteryshutdown': ['sleepMenu'],
      'appsuspended': ['suspendingAppPriorityManager'],
      'appresumed': ['suspendingAppPriorityManager']
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
