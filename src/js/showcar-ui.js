// Todo: remove Zepto
if(!window.jQuery) window.$ = window.Zepto = require('zepto-browserify').$;

let warn = (msg) => window.console && window.console.warn(msg);

window.Storage = require('showcar-storage');
window.Pager = require('./components/pager.js');

window.lazySizesConfig = { loadMode: 1, expFactor: 0, hFac:0 };
require('lazysizes');

// Todo: remove from the library
require('showcar-icons');

const ctor = document.createElement('as24-tracking').constructor;

if (ctor === HTMLElement || ctor === HTMLUnknownElement) {
    require('showcar-tracking');
}

var showcar = {};

showcar.spyNavigation = require('./components/spy-navigation.js');

require('./components/custom-dropdown.js');

$(_ => {
    require('./components/navigation.js');
    require('./components/rotating-arrow.js')(); // Todo: Check usages and remove
    require('./components/sticky.js')();
    require('./components/collapse.js')();
    require('./components/scroll.js');
    require('./components/stepper.js');
});

// TODO: question for the guild
if (!window.notification) {
    window.notification = require('./components/notification.js');
} else {
    warn('window.notification is already registered.');
}

window.showcar = window.showcar || showcar;
module.exports = showcar;
