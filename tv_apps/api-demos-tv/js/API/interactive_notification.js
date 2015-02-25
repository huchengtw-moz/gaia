(function() {
  'use strict';
  /* jshint maxlen: false */
  var imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAABPCAIAAAAlVg/RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDI0Qjk3MTk5MzIyMTFFMUEyMDI4MTE2MjAzRDM1QUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDI0Qjk3MUE5MzIyMTFFMUEyMDI4MTE2MjAzRDM1QUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0MjRCOTcxNzkzMjIxMUUxQTIwMjgxMTYyMDNEMzVBQyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0MjRCOTcxODkzMjIxMUUxQTIwMjgxMTYyMDNEMzVBQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnMmeW8AAC3mSURBVHjaPJx5ryXX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';

  var buttonIds = ['desktop-notification', 'notification-pure',
                   'notification-buttons', 'alert-pure', 'alert-buttons'];

  function $(id) {
    return document.getElementById(id);
  }

  function InteractiveNotification(port) {
    this.iacPort = port;
    this.initEvents();
  }

  var proto = InteractiveNotification.prototype;

  proto.initEvents = function() {
    var self = this;
    buttonIds.forEach(function(b) {
      $(b).addEventListener('click', self);
    });

    this.iacPort.onmessage = function handle(evt) {
      self.handleIACResponse(evt.data);
    };
  };

  proto.handleEvent = function(e) {
    switch(e.target.id) {
      case 'desktop-notification':
        this.sendDesktopNotification();
        break;
      case 'notification-pure':
        this.sendNotification();
        break;
      case 'notification-buttons':
        this.sendNotification([{
          'label': 'button 1',
          'id': 'button-1'
        }, {
          'label': 'button 2',
          'id': 'button-2'
        }]);
        break;
      case 'alert-pure':
        this.sendAlert();
        break;
      case 'alert-buttons':
        this.sendAlert([{
          'label': 'button 1',
          'id': 'button-1'
        }, {
          'icon': imageData,
          'id': 'button-2'
        }]);
        break;
    }
  };

  proto.handleIACResponse = function(data) {
    $('status').textContent = 'notification title: ' + data.message.title +
                              ', type: ' + data.type + ', closed with ' +
                              (data.button || 'cancel key');
  };

  // More power api, certified app only, to show a notification with/without
  // buttons.
  proto.sendNotification = function(buttons) {
    this.iacPort.postMessage({
      'type': 'notification',
      'message': {
        'title': 'notification title text',
        'text': 'this is a notification',
        'buttons': buttons
      }
    });
  };

  // More power api, certified app only, to show a alert with/without buttons.
  proto.sendAlert = function(buttons) {
    this.iacPort.postMessage({
      'type': 'alert-notification',
      'message': {
        'title': 'alert title text',
        'text': 'this is an alert',
        'buttons': buttons
      }
    });
  };

  // 3prd app may use the following code to show a desktop notification.
  proto.sendDesktopNotification = function() {
    var notification = new Notification('title text', {'body': 'body text'});
    notification.onclick = function() {
      $('status').textContent = 'desktop notification is clicked';
    };
    notification.onshow = function() {
      $('status').textContent = 'desktop notification is shown';
    };
    notification.onerror = function() {
      $('status').textContent = 'error while creating desktop notification ';
    };
    notification.onclose = function() {
      $('status').textContent = 'desktop notification is closed';
    };
  };

  window.onload = function() {
    navigator.mozApps.getSelf().onsuccess = function(evt) {
      var app = evt.target.result;
      app.connect('interactivenotifications').then(function onAccepted(ports) {
        window.interactiveNotification = new InteractiveNotification(ports[0]);
      }, function onRejected(reason) {
        console.log('smart-system is rejected');
        console.log(reason);
      });
    };
  };

})();
