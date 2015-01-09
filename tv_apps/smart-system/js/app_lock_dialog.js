/* global AppModalDialog, AirplaneMode */
'use strict';

(function(exports) {

  function AppLockDialog() {
  };

  AppLockDialog.prototype.CLASS_NAME = 'AppLockDialog';

  AppLockDialog.prototype.EVENT_PREFIX = 'applock-';

  AppLockDialog.prototype.handleEvent = function ald_handleEvent(evt) {
    switch(evt.type) {
      case 'appopened':
      case 'homescreenopened':
      case 'attentionopened':
        this.hide('cancel');
        this.publish('hide');
        break;
      case 'click':
        if (evt.target.id === 'app-lock-ok-button') {
          this.hide('ok');
        }
        break;
      case 'keyup':
        if (evt.keyCode === KeyEvent.DOM_VK_BACK_SPACE ||
            evt.keyCode === KeyEvent.DOM_VK_ESCAPE) {
          this.hide('cancel');
        }
        break;
    }
  };

  AppLockDialog.prototype.start = function ald_start() {
    this.element = document.getElementById('app-lock-container');
    this.okBtn = document.getElementById('app-lock-ok-button');

    window.addEventListener('appopened', this);
    window.addEventListener('homescreenopened', this);
    window.addEventListener('attentionopened', this);
    window.addEventListener('keyup', this);
    this.okBtn.addEventListener('click', this);
  };

  AppLockDialog.prototype.stop = function ald_stop() {
    window.removeEventListener('appopened', this);
    window.removeEventListener('homescreenopened', this);
    window.removeEventListener('attentionopened', this);
    window.removeEventListener('keyup', this);
    this.okBtn.removeEventListener('click', this);
  };

  AppLockDialog.prototype.show = function ald_show(pendingJob) {
    if (this._shown) {
      return;
    }
    this._shown = true;
    this._pendingJob = pendingJob;
    this.element.classList.remove('hidden');
    this.publish('shown');
    this.focus();
  };

  AppLockDialog.prototype.focus = function ald_focus() {
    document.activeElement.blur();
    this.okBtn.focus();
  };

  AppLockDialog.prototype.hide = function ald_hide(type) {
    if (!this._shown) {
      return;
    }
    this.element.classList.add('hidden');
    this._shown = false;
    this.publish('hidden', { 'dialog': this,
                             'result': type === 'ok',
                             'pendingJob': this._pendingJob });
    this._pendingJob = null;
  };

  AppLockDialog.prototype.publish = function ald_publish(event, detail) {
    var evt = new CustomEvent(this.EVENT_PREFIX + event, {
      bubbles: true,
      cancelable: false,
      detail: detail || this
    });

    window.dispatchEvent(evt);
  }

  exports.AppLockDialog = AppLockDialog;
}(this));
