(function(exports) {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  }

  exports.WidgetAPITester = {
    widgetManager: null,

    init: function test_init() {
      $('invoke-button').addEventListener('click', this);
    },

    handleEvent: function test_handleEvent(e) {
      if (e.target.id === 'invoke-button') {
        this.invokeAPI($('api-call').value);
      }
    },

    watchEvents: function test_watchEvents(widgetWindow) {
      var iframe = widgetWindow.browser.element;

      function dumpAllEvents(e) {
        console.log(iframe.src + ': ' + e.type + ' received');
      }

      iframe.addEventListener('mozbrowserclose', dumpAllEvents);
      iframe.addEventListener('mozbrowsererror', dumpAllEvents);
      iframe.addEventListener('mozbrowserloadend', dumpAllEvents);
      iframe.addEventListener('mozbrowserloadstart', dumpAllEvents);
      iframe.addEventListener('mozbrowserfirstpaint', dumpAllEvents);
      iframe.addEventListener('mozbrowserdocumentfirstpaint', dumpAllEvents);

      // sensitive events
      iframe.addEventListener('mozbrowserusernameandpasswordrequired',
                                      dumpAllEvents);
      iframe.addEventListener('mozbrowseropenwindow', dumpAllEvents);
      iframe.addEventListener('mozbrowsershowmodalprompt',
                                      dumpAllEvents);
      iframe.addEventListener('mozbrowsercontextmenu', dumpAllEvents);
      iframe.addEventListener('mozbrowsersecuritychange',
                                      dumpAllEvents);
      iframe.addEventListener('mozbrowserlocationchange',
                                      dumpAllEvents);
      iframe.addEventListener('mozbrowsericonchange', dumpAllEvents);
      iframe.addEventListener('mozbrowsertitlechange', dumpAllEvents);
      iframe.addEventListener('mozbrowseropensearch', dumpAllEvents);
      iframe.addEventListener('mozbrowsermanifestchange', dumpAllEvents);
      iframe.addEventListener('mozbrowsermetachange', dumpAllEvents);

      // no use case
      iframe.addEventListener('mozbrowserasyncscroll', dumpAllEvents);
      iframe.addEventListener('mozbrowserresize', dumpAllEvents);
      iframe.addEventListener('mozbrowseractivitydone', dumpAllEvents);
      iframe.addEventListener('mozbrowserscroll', dumpAllEvents);

    },

    _invokeAPI: function test__invokeAPI(iframe, api) {
      function nextPaintListener(e) {
        console.log(iframe.src + ': ' + e.type + ' received');
      }

      switch(api) {
        case 'setVisible':
          iframe.getVisible().onsuccess = function(e) {
            iframe.setVisible(!e.target.result);
            console.log(iframe.src + ' setVisible: ' + !e.target.result +
                        ' called');
          };
          break;
        case 'getVisible':
          iframe.getVisible().onsuccess = function(e) {
            console.log(iframe.src + ' getVisible: ' + e.target.result);
          };

          break;
        case 'addNextPaintListener':
          iframe.addNextPaintListener(nextPaintListener);
          console.log(iframe.src + ' addNextPaintListener called');
          break;
        case 'removeNextPaintListener':
          iframe.removeNextPaintListener(nextPaintListener);
          console.log(iframe.src + ' removeNextPaintListener called');
          break;
        case 'sendMouseEvent':
          iframe.sendMouseEvent('mouseup', 10, 10, 0, 1, 0);
          console.log(iframe.src + ' sendMouseEvent called');
          break;
        case 'sendTouchEvent':
          iframe.sendTouchEvent('touchstart', [10], [10], [10], [10], [0],
                                              [0.9], 1, 0);
          iframe.sendTouchEvent('touchend', [10], [10], [10], [10], [0],
                                            [0.9], 1, 0);
          console.log(iframe.src + ' sendTouchEvent called');
          break;
        case 'getScreenshot':
          var req = iframe.getScreenshot(500, 500, 'image/jpeg');
          req.onsuccess = function() {
            var storage = navigator.getDeviceStorage('pictures');
            var delReq = storage.delete('widget-screenshot.jpg');
            delReq.onsuccess = delReq.onerror = function() {
              storage.addNamed(req.result, 'widget-screenshot.jpg');
            };
            console.log(iframe.src + ' getScreenshot ok, please check ' +
                        'widget-screenshot.jpg');
          };
          req.onerror = function() {
            console.log('getScreenshot error: ' + req.error.name);
          };
          break;
      }
    },

    invokeAPI: function test_invokeAPI(api) {
      if (!this.widgetManager) {
        return;
      }
      var widgets = this.widgetManager.runningWidgetsById;
      for (var key in widgets) {
        var iframe = widgets[key].browser.element;
        this._invokeAPI(iframe, api);
      }
    }
  };
})(window);
