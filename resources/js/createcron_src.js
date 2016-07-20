'use strict';

// require('proxy-polyfill');
require('./proxypollfill');
require('es6-promise').polyfill();
const cronhelper = require('./pretty_cron_helper');
const CronJob = require('cron').CronJob;
let elements = {
	cronitems: {}
};
let $ = function (selector) {
	return document.querySelector(selector);
};
let traps = {
	set: function (obj, prop, value) {
		let prettyCronDisplay;
		try {
			let cj = new CronJob(value, function () {
				console.log('this should not be printed');
			});
			prettyCronDisplay = cronhelper.get_pretty_cron_display(value);
			elements.crondisplay.innerText = `${prettyCronDisplay.prettyString} | Next Cron will run ${prettyCronDisplay.prettyNext}`;
			elements.croninterval.value = value;
			obj[prop] = value;
			return true;
		}
		catch (ex) {
			elements.crondisplay.value = ex.toString().replace('Error', 'Cron pattern not valid');
			return true;
		}
	}
};
let cronstring = new Proxy({
	value: '00 00 * * * *'
}, traps);

const get_cronstring = () => {
	return cronhelper.cron_items.map((ci) => {
			return elements.cronitems[`cron_input_${ci}`].value;
		})
		.join(' ');
};

const update_cron_string = () => {
	cronstring.value = get_cronstring();
};

const initElementSelectors = () => {
	cronhelper.cron_items.forEach((ci) => {
		elements.cronitems[`cron_input_${ci}`] = $(`[name="interval-${ci}"]`);
		elements.cronitems[`cron_input_${ci}`].addEventListener('change', update_cron_string);
	});
	elements.crondisplay = $('#interval-display');
	elements.croninterval = $('#cron-interval');
	cronstring.value = get_cronstring();
};

const init = () => {
	initElementSelectors();
	// console.log('loaded....', x);
	// console.log('what is Proxy', Proxy);
	window.selectedElements = elements;
};

if (typeof window.domLoadEventFired !== 'undefined') {
	init();
}
else {
	window.addEventListener('load', init, false);
}
