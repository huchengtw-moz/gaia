'use strict';
/* global KeyEvent */
(function(exports) {

  const keysLayout = [
    [
      { 'key': 'UP',
        'keyCode': KeyEvent.DOM_VK_UP }
    ],
    [
      { 'key': 'LEFT',
        'keyCode': KeyEvent.DOM_VK_LEFT },
      { 'key': 'OK',
        'keyCode': KeyEvent.DOM_VK_RETURN },
      { 'key': 'RIGHT',
        'keyCode': KeyEvent.DOM_VK_RIGHT }
    ],
    [
      { 'key': 'DOWN',
        'keyCode': KeyEvent.DOM_VK_DOWN }
    ]
  ];

  exports.OSDKeyboard = {

    container: document.getElementById('osd-keyboard'),

    _createButton: function(container, keyCfg, size) {
      var button = document.createElement('button');
      button.textContent = keyCfg.key;
      button.dataset.keyCode = keyCfg.keyCode;
      button.addEventListener('click', this);
      button.style.width = size;
      button.classList.add('osd-button');
      container.appendChild(button);
    },

    /**
     * Builds dom and adds event listeners
     * @memberof OSDKeyboard.prototype
     */
    start: function() {
      // Create the structure
      for(var i = 0; i < keysLayout.length; i++) {
        var div = document.createElement('div');
        var buttonSize = Math.round(100 / keysLayout[i].length) + '%';
        for(var j = 0; j < keysLayout[i].length; j++) {
          this._createButton(div, keysLayout[i][j], buttonSize);
        }
        this.container.appendChild(div);
      }

      window.addEventListener('mozbrowserbeforekeydown', this);
      window.addEventListener('mozbrowserbeforekeyup', this);
      window.addEventListener('mozbrowserkeydown', this);
      window.addEventListener('mozbrowserkeyup', this);
    },

    /**
     * Removes the dom and stops event listeners
     * @memberof ActionMenu.prototype
     */
    stop: function() {
      this.container.innerHTML = '';
      window.removeEventListener('mozbrowserbeforekeydown', this);
      window.removeEventListener('mozbrowserbeforekeyup', this);
      window.removeEventListener('mozbrowserkeydown', this);
      window.removeEventListener('mozbrowserkeyup', this);
    },

    /**
     * General event handler interface.
     * Handles submission and cancellation events.
     * @memberof ActionMenu.prototype
     * @param  {DOMEvent} evt The event.
     */
    handleEvent: function(evt) {
      var target = evt.target;
      var type = evt.type;
      switch (type) {
        case 'click':
          console.log('button click: ' + target.dataset.keyCode);
          break;

        case 'mozbrowserbeforekeydown':
        case 'mozbrowserbeforekeyup':
          console.log('before ' + type + ': ' + evt.key);
          break;

        case 'mozbrowserkeydown':
        case 'mozbrowserkeyup':
          console.log('after ' + type + ': ' + evt.key);
          break;
      }
    }
  };

  exports.OSDKeyboard.start();
}(window));
