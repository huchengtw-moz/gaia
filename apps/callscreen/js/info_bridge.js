(function() {
  'use strict';
  var calls = {};
  var connectedPorts;

  function init() {
    navigator.mozApps.getSelf().onsuccess = function() {
      var app = this.result;
      // If IAC doesn't exist, just bail out.
      if (!app.connect) {
        return;
      }

      app.connect('tvbridge').then(function(ports) {
        connectedPorts = ports;
      });
    };
  }

  function sendMessage(state, number, contact) {
    // TODO IAC with system app.
    var data = {
      'state': state,
      'number': number,
      'contact': contact
    };
    connectedPorts.forEach(function(p) {
      console.log('post message to system.');
      p.postMessage(data);
    });
  }

  window.InfoBridge = {
    notifyIncomingCall: function(number, name) {
      calls[number] = {
        'contact': name,
        'state': 'ringing'
      };
      sendMessage('ringing', number, name);
    },
    notifyCallEnd: function(number) {
      switch(calls[number].state) {
        case 'ringing':
          // hangup by remote
          sendMessage('hangup', number);
          break;
        case 'answered':
          // hangup by connected remote/local
          sendMessage('callend', number);
          break;
        case 'rejected':
          // rejected by user
          sendMessage('rejected', number);
          break;
      }
      delete calls[number];
    },
    notifyCallAnswered: function(number) {
      calls[number].state = 'answered';
      sendMessage('picked', number);
    },
    notifyUserRejected: function(number) {
      calls[number].state = 'rejected';
    }
  };

  init();
})();
