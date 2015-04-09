/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
'use strict';
/* global Service, LockScreenWindow, LockScreenInputWindow, BaseModule */
/* global secureWindowManager */

(function(exports) {
  /**
   * Manage LockScreenWindow apps. This is a subset of the AppWindow manager,
   * and will not handle most cases the later one would handle. Only those
   * meaningful cases, like secure app open, close, requesting kill all apps
   * or turn the secure mode on/off, would be handled. However, if we need
   * to handle cases in the future, we would extend this manager.
   *
   * So far the LockScreenWindowManager would only manager 1 secure app at once,
   * but there're already some designations for multiple apps.
   *
   * @constructor LockScreenWindowManager
   */
  var LockScreenWindowManager = function() {};

  LockScreenWindowManager.SERVICES = [
    'unlock',
    'lock'
  ];

  LockScreenWindowManager.STATES = [
    'locked',
    'hasSecureWindow'
  ];

  LockScreenWindowManager.EVENTS = [
    'lockscreen-request-unlock',
    'lockscreen-appcreated',
    'lockscreen-appterminated',
    'lockscreen-appclose',
    'screenchange',
    'system-resize',
    'ftuopen',
    'ftudone',
    'overlaystart',
    'showlockscreenwindow',
    'secure-appclosed',
    'lockscreen-request-inputpad-open',
    'lockscreen-request-inputpad-close'
  ];

  LockScreenWindowManager.SUB_MODULES = [
    'SecureWindowManager'
  ];

  BaseModule.create(LockScreenWindowManager, {
    EVENT_PREFIX: 'lockscreenwindowmanager',
    name: 'LockScreenWindowManager',

    locked: function lswm_locked() {
      // Someone ask this state too early.
      return this.isActive();
    },

    hasSecureWindow: function lswm_hasSecureWindow() {
      return this.secureWindowManager.isActive();
    },

    setup: function lswm_setup() {
      /**
       * @memberof LockScreenWindowManager#
       * @prop {DOMElement} windows - the `#windows` element, which is the same
       *                            element that the would AppWindowManager use.
       * @prop {DOMElement} screen - the `#screen` element.
       */
      this.elements = {
        windows: null,
        screen: null
      };

      /**
       * @memberof LockScreenWindowManager#
       */
      this.states = {
        ready: false,
        FTUOccurs: false,
        enabled: true,
        instance: null,
        windowCreating: false
      };

      /**
       * @memberof LockScreenWindowManager#
       */
      this.configs = {
        inputWindow: {
          // Before we put things inside an iframe, do not resize LW.
          resizeMode: false,
          get height() {
            return 300;
          }
        }
      };
    },

    /**
     * This function will be invoked by hierarchyManager.
     */
    getActiveWindow: function lwm_getActiveWindow() {
      return this.isActive() ? this.states.instance : null;
    },

    /**
     * To initialize the class instance (register events, observe settings,
     * etc.)
     */
    _start: function lwm__start() {
      this.setup();
      // this.startEventListeners();
      this.startObserveSettings();
      this.initElements();
      this.initWindow();
      Service.request('registerHierarchy', this);
    },

    '_handle_home': function lwm_handle_home() {
      if (this.isActive()) {
        // XXX: I don't want to change the order of event registration
        // at this early-refactoring stage, so do this to minimize the
        // risk and complete the work.
        window.dispatchEvent(
          new CustomEvent('lockscreen-notify-homepressed'));
        return false;
      }
      return true;
    },

    '_handle_holdhome': function lwm_handle_holdhome() {
      if (this.isActive()) {
        return false;
      }
      return true;
    },

    respondToHierarchyEvent: function lwm_respondToHierarchyEvent(evt) {
      if (this['_handle_' + evt.type]) {
        return this['_handle_' + evt.type](evt);
      } else {
        return true;
      }
    },

    '_handle_overlaystart': function lwm_handle_overlaystart(evt) {
      if (this.isActive()) {
        this.states.instance.setVisible(false);
      }
    },

    '_handle_showlockscreenwindow': function lwm_handle_showlswindow(evt) {
      if (this.isActive()) {
        this.states.instance.setVisible(true);
      }
    },

    '_handle_ftuopen': function lwm_handle_ftuopen(evt) {
      this.states.FTUOccurs = true;
      // Need immediatly unlocking (hide window).
      this.closeApp(true);
    },

    '_handle_ftudone': function lwm_handle_ftudone(evt) {
      this.states.FTUOccurs = false;
    },

    '_handle_lockscreen-request-unlock': function lwm_handle_req_unlock(evt) {
      this.responseUnlock(evt.detail);
    },

    /**
     * @listens lockscreen-appcreated - when a lockscreen app got created, it
     *                                  would fire this event.
     * @listens lockscreen-appterminated - when a lockscreen app got really
     *                                     closed, it would fire this event.
     * @listens lockscreen-apprequestclose - when a lockscreen app has been
     *                                       called to close itself, the event
     *                                       would be fired
     * @listens screenchange - means to initialize the lockscreen and its window
     * @this {LockScreenWindowManager}
     * @memberof LockScreenWindowManager
     */
    '_handle_lockscreen-appcreated': function lwm_handle_ls_appcreated(evt) {
      this.registerApp(evt.detail);
    },

    '_handle_lockscreen-appterminated': function lwm_handle_ls_appended(evt) {
      this.unregisterApp(evt.detail);
    },

    '_handle_secure-appclosed': function lwm_handle_secure_appclosed(evt) {
      this.states.instance.lockOrientation();
    },

    '_handle_system-resize': function lwm_handle_system_resize(evt) {
      if (this.states.instance && this.states.instance.isActive()) {
        this.states.instance.resize();
      }
    },

    '_handle_screenchange': function lwm_handle_screenchange(evt) {
      // The screenchange may be invoked by proximity sensor,
      // or the power button. If it's caused by the proximity sensor,
      // we should not open the LockScreen, because the user may stay
      // in another app, not the LockScreen.
      if ('proximity' !== evt.detail.screenOffBy &&
          !this.states.FTUOccurs &&
          this.states.ready) {
        // The app would be inactive while screen off.
        this.openApp();
        if (evt.detail.screenEnabled && this.states.instance &&
            this.isActive() && !secureWindowManager.isActive()) {
          // In theory listen to 'visibilitychange' event can solve this
          // issue, since it would be fired at the correct moment that
          // we can lock the orientation successfully, but this event
          // would not be received when user press the button twice
          // quickly, so we need to keep this workaround.
          this.states.instance.lockOrientation();
        }
      }
    },

    '_handle_lockscreen-request-inputpad-open':
      function lwm_handle_lockscreen_request_inputpad_open(evt) {
        this.onInputpadOpen();
      },

    '_handle_lockscreen-request-inputpad-close':
      function lwm_handle_lockscreen_request_inputpad_close(evt) {
        this.onInputpadClose();
      },

    /**
     * @private
     * @this {LockScreenWindowManager}
     * @memberof LockScreenWindowManager
     */
    initElements: function lwm_initElements() {
      var selectors = { windows: 'windows', screen: 'screen'};
      for (var name in selectors) {
        var id = selectors[name];
        this.elements[name] = document.getElementById(id);
      }
    },

    /**
     * Hook observers of settings to allow or ban window opening.
     *
     * @private
     * @this {LockScreenWindowManager}
     * @memberof LockScreenWindowManager
     */
    startObserveSettings: function lwm_startObserveSettings() {
      var enabledListener = (val) => {
        this.states.ready = true;
        if ('false' === val ||
            false   === val) {
          this.states.enabled = false;
        } else if('true' === val ||
                  true   === val) {
          this.states.enabled = true;
          // For performance reason, we need to create window at the moment
          // the settings get enabled.
          if (!this.states.instance) {
            this.createWindow();
          }
        }
      };

      // FIXME(ggp) this is currently used by Find My Device to force locking.
      // Should be replaced by a proper IAC API in bug 992277.
      var lockListener = (event) => {
        if (true === event.settingValue) {
          this.openApp();
        }
      };

      window.SettingsListener.observe('lockscreen.enabled',
        true, enabledListener);

      // We are only interested in changes to the setting, rather
      // than its value, so just observe it instead of using SettingsListener
      navigator.mozSettings.addObserver('lockscreen.lock-immediately',
          lockListener);
    },

    /**
     * Close the lockscreen app.
     * If it's not enabled, would do nothing.
     *
     * @param {boolean} instant - true if instantly close.
     * @private
     * @this {LockScreenWindowManager}
     * @memberof LockScreenWindowManager
     */
    closeApp: function lwm_closeApp(instant) {
      if (!this.states.enabled || !this.isActive()) {
        return;
      }
      this.states.instance.close(instant ? 'immediate': undefined);
      this.elements.screen.classList.remove('locked');
      this.toggleLockedSetting(false);
      this.publish(this.EVENT_PREFIX + '-deactivated', this);
    },

    /**
     * Open the lockscreen app.
     * If it's necessary, would create a new window.
     * If it's not enabled, would do nothing.
     *
     * @private
     * @this {LockScreenWindowManager}
     * @memberof LockScreenWindowManager
     */
    openApp: function lwm_openApp() {
      if (!this.states.enabled) {
        return;
      }
      if (!this.states.instance) {
        var app = this.createWindow();
        app.open();
      } else {
        this.states.instance.open();
      }
      this.elements.screen.classList.add('locked');
      this.toggleLockedSetting(true);
      this.publish(this.EVENT_PREFIX + '-activated', this);
    },

    /**
     * Message passing method. Would publish to the whole System app.
     *
     * @private
     * @this {LockScreenWindowManager}
     * @memberof LockScreenWindowManager
     */
    publish: function lwm_publish(ne, detail) {
      var event = new CustomEvent(ne, { detail: detail });
      window.dispatchEvent(event);
    },

    /**
     * @private
     * @this {LockScreenWindowManager}
     * @memberof LockScreenWindowManager
     */
    registerApp: function lwm_registerApp(app) {
      this.states.instance = app;
    },

    /**
     * @private
     * @this {LockScreenWindowManager}
     * @memberof LockScreenWindowManager
     */
    unregisterApp: function lwm_unregisterApp(app) {
      this.states.instance = null;
    },

    /**
     * When screenchange hanneped, create LockScreen and LockScreenWindow
     * if it is needed.
     *
     * @private
     * @return {LockScreenWindow}
     * @this {LockScreenWindowManager}
     * @memberof LockScreenWindowManager
     */
    createWindow: function lwm_createWindow() {
      if (this.states.windowCreating) {
        return false;
      }
      this.states.windowCreating = true;
      var app = new LockScreenWindow();
      // XXX: Before we can use real InputWindow and InputWindowManager,
      // we need this to
      app.inputWindow = new LockScreenInputWindow();
      this.states.windowCreating = false;
      return app;
    },

    /**
     * First time we launch, we must check the init value of enabled,
     * to see if we need to open the window.
     *
     * @private
     * @this {LockScreenWindowManager}
     * @memberof LockScreenWindowManager
     */
    initWindow: function lwm_initWindow() {
      var req = window.SettingsListener.getSettingsLock()
        .get('lockscreen.enabled');
      req.onsuccess = () => {
        this.states.ready = true;
        if (true === req.result['lockscreen.enabled'] ||
           'true' === req.result['lockscreen.enabled']) {
          this.states.enabled = true;
        } else if (false === req.result['lockscreen.enabled'] ||
                   'false' === req.result['lockscreen.enabled']) {
          this.states.enabled = false;
        }
        this.openApp();
      };
    },

    unlock: function lwm_unlock(detail) {
      // XXX:
      // There is a self-routing here:
      // Service.request('unlock') ->
      // LockScreenWindowManager#unlock ->
      // ['lockscreen-request-unlock'] ->
      // LockScreenWindowManager#responseUnlock |
      // VisibilityManager#firing showwindow
      //
      // We should just call responseUnlock here,
      // but VisibilityManager needs this event to notify
      // AppWindowManager to showwindow correctly;
      // The reason not using lockscreen-appclosing/lockscreen-appclosed
      // is the race of mozActivity launch coming from lockscreen
      // and homescreen will race to be opened and cause performance issue.
      //
      // We should adjust LockScreenWindow to use lockscreen-appclosing/closed
      // to have the activitiy/notification info hence we could change
      // VisibilityManager later to avoid this workaround.
      this.publish('lockscreen-request-unlock', detail);
    },

    responseUnlock: function lwm_responseUnlock(detail) {
      var forcibly = (detail && detail.forcibly) ? true : false;
      this.closeApp(forcibly);
    },

    lock: function lwm_lock(detail) {
      this.openApp();
    },

    getInstance: function lwm_getInstance() {
      return this.states.instance;
    },

    isActive: function lwm_isActive() {
      if (null === this.states.instance) {
        return false;
      } else {
        return this.states.instance.isActive();
      }
    },

    onInputpadOpen: function lwm_onInputpadOpen() {
      this.states.instance.inputWindow.open();
      this.states.instance.resize();
    },

    onInputpadClose: function lwm_onInputpadClose() {
      this.states.instance.inputWindow.close();
      this.states.instance.resize();
    },

    toggleLockedSetting: function lswm_toggleLockedSetting(value) {
      if (!window.navigator.mozSettings) {
        return;
      }
      window.SettingsListener.getSettingsLock().set({
        'lockscreen.locked': value
      });
    }
  });
})(window);
