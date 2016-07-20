'use strict';

const prettyCron = require('prettycron');
const later = require('later');
const Moment = require('moment');
later.date.localTime();

exports.get_pretty_cron_display = (cronstring) => {
	let cronstring_element_array = cronstring.split(' ');
	let cronstring_to_use = (cronstring_element_array.length === 6) ? cronstring_element_array.slice(1).join(' ') : cronstring;
	let schedule = later.parse.cron(cronstring_to_use);
	let prettyNextCron = new Moment(later.schedule(schedule).next()).calendar();

	return {
		prettyString: prettyCron.toString(cronstring_to_use),
		prettyNext: prettyNextCron,
	};
};
exports.cron_items = ['second', 'minute', 'hour', 'date', 'month', 'year'];
