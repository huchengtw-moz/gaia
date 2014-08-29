(function(exports) {
  exports.TVBridge = {
    init: function() {
      window.addEventListener('iac-tvbridge', this);
    },

    handleEvent: function(e) {
      if ('iac-tvbridge' !== e.type) {
        return;
      }
      var message = e.detail;
      console.log(message.state, message.number, message.contact);
    }
  };

  exports.TVBridge.init();
})(window);
