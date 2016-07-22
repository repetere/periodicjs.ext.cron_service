'use strict';

const pretty_cron_helper = require('../resources/js/pretty_cron_helper');

let data_attributes = [
	{label: 'Title',sortactive:true,sortid:'title',sortorder:'asc'},
	{label: 'Create Date',sortactive:true,sortid:'createdat',sortorder:'asc'},
	{label: 'Cron Interval',sortactive:true,sortid:'cron_interval',sortorder:'asc'},
	{label: 'Active',sortactive:true,sortid:'active',sortorder:'asc'},
	{label: 'ID'},
	{label: 'Options'},
];

let data_attributes_all = Object.assign([], data_attributes);

let tbody_function = function (options) {
	let {Moment,locals,show_theme} = options;
	return {
			tag: 'tr',
			style: 'vertical-align:top;',
			html: function (obj) {
				let crondisplay = pretty_cron_helper.get_pretty_cron_display(obj.cron_interval);
				var jsontablehtml;
				var setactivevar = (obj.active) ? false : true;
				jsontablehtml = `<td>
					<a href="/${locals.adminPath}/content/crons/${obj.name}" class="async-admin-ajax-link">${obj.title}</a></br>
					<span class="ts-text-xs">${crondisplay.prettyString}</span></br>
					<span class="ts-text-xs">${crondisplay.prettyNext}</span></br>
				</td>`; 
				if (show_theme) {
					jsontablehtml += (!obj.theme)?'':`<td>${ obj.theme.replace(/periodicjs.theme./gi,'') }</td>`;
				}
				jsontablehtml += `<td>${new Moment(obj.createdat).format('MM/DD/YYYY |  hh:mm:ssa')}</td>`;
				jsontablehtml += `<td>${ obj.cron_interval }</td>`;
				jsontablehtml += '<td>';
				jsontablehtml += `<a data-href="/${ locals.adminPath }/content/crons/setactive/${ obj._id }/${ setactivevar }" data-ajax-method="post" data-redirect-href="/${ locals.adminPath }/content/crons"  class="ts-button ts-ajax-button ">${ obj.active }</a>`;jsontablehtml += '</td>';
				jsontablehtml += `<td><a href="/${ locals.adminPath }/content/crons/${ obj._id }" class="async-admin-ajax-link">${ obj._id }</a></td>`;
				if (show_theme && obj.theme !== locals.theme_name) {
					jsontablehtml += '<td><label="ts-label">only runs in theme </label></td>';					
				}
				else	{
					jsontablehtml += `<td><a href="/${ locals.adminPath }/content/crons/${ obj._id }/" class="async-admin-ajax-link">edit</a>`;
					jsontablehtml += ` | <a alt="delete" data-ajax-method="delete" class=" ts-dialog-delete" data-href="/${ locals.adminPath }/content/crons/${ obj._id }/" data-deleted-redirect-href="/${ locals.adminPath }/content/crons">delete</a>`;
					jsontablehtml += ` | <a alt="fire" data-ajax-method="get" class="ts-dialog-delete" data-href="/${ locals.adminPath }/content/cron/${ obj._id }/run">run</a>`;
					jsontablehtml += ` | <a alt="validate" data-ajax-method="get" class="ts-dialog-delete" data-href="/${ locals.adminPath }/content/cron/${ obj._id }/validate">validate</a>`;
					jsontablehtml += ` | <a alt="test" data-ajax-method="get" class="ts-dialog-delete" data-href="/${ locals.adminPath }/content/cron/${ obj._id }/mocha">test</a>`;
					jsontablehtml += '</td>';
				}
				return jsontablehtml;
			}
		};
	};

module.exports = function (resources) {
	data_attributes_all.splice(1, 0, { label: 'Theme', sortactive: true, sortid: 'theme', sortorder: 'asc' });

	return {
		cron_table: {
			data_attributes,
			data_attributes_all,
			responsive_collapse: {
				getCollapseNameFunction:function(obj){return obj.email;},
				editlink: `/${ resources.app.locals.adminPath }/content/crons/|||_id|||`,
				deletelink: `/${ resources.app.locals.adminPath }/content/crons/|||_id|||/delete`,
				deleterefreshlink: `/${ resources.app.locals.adminPath }/content/crons/`
			},
			tbody: tbody_function,
		}
	};
};