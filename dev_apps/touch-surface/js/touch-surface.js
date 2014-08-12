
(function() {

  const DRAW_ON_FRAME_UPDATE = true;

  window.requestAnimationFrame = window.requestAnimationFrame ||
                                 window.mozRequestAnimationFrame ||
                                 window.webkitRequestAnimationFrame ||
                                 window.oRequestAnimationFrame;

  var TouchSurface = {
    init: function() {
      this.canvas = document.getElementById('main-canvas');
      // we draw 4 px at left and right borders.
      this.canvas.width = window.innerWidth - 8;
      // we draw 4 px at top and bottom borders.
      this.canvas.height = window.innerHeight - 8;
      this.context = this.canvas.getContext('2d', { willReadFrequently: true });
      this.clearButton = document.getElementById('clear-button');
      // preload the icon image
      this.iconImg = new Image();
      this.iconImg.src = 'style/firefox-icon.png';
      var self = this;
      // load it.
      this.iconImg.onload = function() {
        self.start();
      };
    },

    start: function() {
      this.requestQueue = [];
      this.canvas.addEventListener('touchstart', this);
      this.canvas.addEventListener('touchmove', this);
      this.clearButton.addEventListener('click', this);
    },

    stop: function() {
      this.canvas.removeEventListener('touchstart', this);
      this.canvas.removeEventListener('touchmove', this);
      this.clearButton.removeEventListener('click', this);
    },

    _drawInAnimiationFrame: function() {
      var self = this;
      this.requestQueue.forEach(function(pos) {
        self.context.drawImage(self.iconImg, pos.x - self.iconImg.width / 2,
                               pos.y - self.iconImg.height / 2);
      });
      this.requestQueue = [];
      this.requestId = null;
    },

    drawIconAt: function(x, y) {
      if (DRAW_ON_FRAME_UPDATE) {
        this.requestQueue.push({ 'x': x, 'y': y });
        if (!this.requestId) {
          this.requestId = window.requestAnimationFrame(
                                        this._drawInAnimiationFrame.bind(this));  
        }
      } else {
        this.context.drawImage(this.iconImg, x - this.iconImg.width / 2,
                               y - this.iconImg.height / 2);
      }
    },

    handleEvent: function(e) {
      switch(e.type) {
        case 'touchstart':
        case 'touchmove':
          for (var i = e.changedTouches.length - 1; i >= 0; i--) {
            var touch = e.changedTouches[i];
            this.drawIconAt(touch.clientX, touch.clientY);
          };
          break;
        case 'click':
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          break;
      }
    }
  }

  window.onload = function() {
    window.onload = null;
    TouchSurface.init();
  };
})();
