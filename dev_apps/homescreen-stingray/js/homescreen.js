'use strict';

(function(exports) {
  function Homescreen() {
  }

  Homescreen.prototype = {
    init: function() {
      var selectionBorder = new SelectionBorder(false);
      var nodeList = document.querySelectorAll('.target');
      var selected = -1;
      window.addEventListener('keypress', function() {
        if (selected < nodeList.length) {
          selectionBorder.select(nodeList[selected++]);
        } else {
          selected = 0;
          selectionBorder.select(nodeList[0]);
        }
      });
    },

    uninit: function() {
    }
  };

  exports.Homescreen = Homescreen;
})(window);
