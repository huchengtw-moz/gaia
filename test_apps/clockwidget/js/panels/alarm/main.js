define(function(require) {
'use strict';

var Panel = require('panel');
var ClockView = require('panels/alarm/clock_view');
//var AlarmList = require('panels/alarm/alarm_list');
//var ActiveAlarm = require('panels/alarm/active_alarm');
var html = require('text!panels/alarm/panel.html');

function AlarmPanel() {
  Panel.apply(this, arguments);

  this.element.innerHTML = html;
  ClockView.init();
}

AlarmPanel.prototype = Object.create(Panel.prototype);

console.log(window.innerWidth);
console.log(window.innerHeight);

return AlarmPanel;
});
