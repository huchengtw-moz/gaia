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
    for (var k in this.customEventHandlers) {
      window.addEventListener(k, this);
    }
    for (var k in this.customEventHandlersInCaptureMode) {
      window.addEventListener(k, this, true);
    }
    for (var k in this.settingsHandler) {
      SettingsCache.observe(k, this.settingsHandler[k].defaultValue,
                            this.handleSettingsChanged.bind(this, k));
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
      },
      'textSelectionDialog': {
        'file': ['/style/textselection_dialog/textselection_dialog.css',
                 '/js/text_selection_dialog.js'],
        'className': 'TextSelectionDialog',
        'exportToWindow': 'textSelectionDialog'
      },
      'ttlView': {
        'file': ['/style/ttlview/ttlview.css', '/js/ttlview.js'],
        'className': 'TTLView',
        'exportToWindow': 'ttlView'
      },
      'wrapperFactory': {
        'file': '/js/wrapper_factory.js',
        'className': 'WrapperFactory',
        'exportToWindow': 'wrapperFactory'
      },
      'developerHUD': {
        'file': ['/style/devtools/developer_hud.css',
                 '/js/devtools/developer_hud.js'],
        'className': 'DeveloperHUD',
        'exportToWindow': 'developerHUD'
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
      'remote-debugger-prompt': ['remoteDebugger'],
      'selectionchange': ['textSelectionDialog'],
      'scrollviewchange': ['textSelectionDialog']
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
      'appresumed': ['suspendingAppPriorityManager'],
      'value-selector-shown': ['textSelectionDialog'],
      'value-selector-hidden': ['textSelectionDialog']
    },

    customEventHandlersInCaptureMode: {
      'mozbrowseropenwindow': ['wrapperFactory']
    },

    settingsHandler: {
      'debug.ttl.enabled': [{
        'handler': 'ttlView',
        'defaultValue': false,
        'observingValue': true
      }],
      'devtools.overlay': [{
        'handler': 'developerHUD',
        'defaultValue': false,
        'observingValue': true
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
      if (!this.customEventHandlers[evt.type] &&
          !this.customEventHandlersInCaptureMode[evt.type]) {
        return;
      }

      var handlers = evt.eventPhase === Event.CAPTURING_PHASE ?
                       this.customEventHandlersInCaptureMode[evt.type] :
                       this.customEventHandlers[evt.type];
      this.pipeToHandlers(handlers, evt);
    },

    pipeToHandlers: function(handlers, evt) {
      var self = this;
      handlers.forEach(function(name) {
        self.loadModule(self.handlers[name], function handleCreated(handler) {
          // If handler has handleEvent, we need to pipe event to it.
          // Otherwise, we just lazy load the module.
          if (!handler.onlyLazyLoad &&
              (typeof handler.instance['handleEvent']) === 'function') {
            handler.instance.handleEvent(evt);
          }
        });
      });
    },

    handleSettingsChanged: function(key, value) {
      if (!this.settingsHandler[key]) {
        return;
      }

      var self = this;
      this.settingsHandler[key].forEach(function(handlerDef) {
        if (handlerDef.observingValue === value) {
          // we only lazy load modules in settings case.
          self.loadModule(self.handlers[handlerDef.handler]);
        }
      });
    },

    loadModule: function(handler, callback) {
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
          if (callback) {
            callback(handler)
          }
        });
      } else if (callback) {
        callback(handler);
      }
    }
  };

  exports.ModuleLoader = ModuleLoader;

}(window));
