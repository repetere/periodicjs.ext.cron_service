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
			if (elements.croninterval) {
				elements.croninterval.value = value;
			}
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

const auto_update_cron_string = () => {
	cronstring.value = elements.auto_update_croninterval.value;
};

const initElementSelectors = () => {
	let has_individual_cron_items = false;
	cronhelper.cron_items.forEach((ci) => {
		let interval_ci_element = $(`[name="interval-${ci}"]`);
		if (interval_ci_element) {
			has_individual_cron_items = true;
			elements.cronitems[`cron_input_${ci}`] = interval_ci_element;
			elements.cronitems[`cron_input_${ci}`].addEventListener('change', update_cron_string);
		}
	});
	elements.crondisplay = $('#interval-display');
	elements.croninterval = $('#cron-interval');
	elements.auto_update_croninterval = $('[data-auto-update-interval="true"]');
	// console.log('elements.auto_update_croninterval', elements.auto_update_croninterval);
	if (elements.auto_update_croninterval) {
		elements.auto_update_croninterval.addEventListener('change', auto_update_cron_string);
		cronstring.value = elements.auto_update_croninterval.value;
	}
	if (has_individual_cron_items) {
		cronstring.value = get_cronstring();
	}
};

const init = () => {
	initElementSelectors();
	// console.log('what is Proxy', Proxy);
	window.selectedElements = elements;
};

if (typeof window.domLoadEventFired !== 'undefined') {
	init();
}
else {
	window.addEventListener('load', init, false);
}
