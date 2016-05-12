'use strict';

module.exports = function (resources) {
	return {
		cron_table: {
			data_attributes: [
			 	{label: 'Title',sortactive:true,sortid:'title',sortorder:'asc'},
			 	{label: 'Create Date',sortactive:true,sortid:'createdat',sortorder:'asc'},
			 	{label: 'Cron Interval',sortactive:true,sortid:'cron_interval',sortorder:'asc'},
			 	{label: 'Active',sortactive:true,sortid:'active',sortorder:'asc'},
			 	{label: 'ID'},
				{label: 'Options'},
			],
			responsive_collapse: {
				getCollapseNameFunction:function(obj){return obj.email;},
				editlink: `/${ resources.app.locals.adminPath }/content/crons/|||_id|||`,
				deletelink: `/${ resources.app.locals.adminPath }/content/crons/|||_id|||/delete`,
				deleterefreshlink: `/${ resources.app.locals.adminPath }/content/crons/`
			},
			tbody: function(Moment){
				return {
					tag: 'tr',
					style: 'vertical-align:top;',
					html: function (obj) {
						var jsontablehtml;
						var setactivevar = (obj.active) ? false : true;
						jsontablehtml = `<td><a href="/${ resources.app.locals.adminPath }/content/crons/${ obj.name }" class="async-admin-ajax-link">${ obj.title }</a></td>`; 
						jsontablehtml += `<td>${ new Moment(obj.createdat).format('MM/DD/YYYY |  hh:mm:ssa') }</td>`;
						jsontablehtml += `<td>${ obj.cron_interval }</td>`;
						jsontablehtml += '<td>';
						jsontablehtml += `<a data-href="/${ resources.app.locals.adminPath }/content/crons/setactive/${ obj._id }/${ setactivevar }" data-ajax-method="post" data-redirect-href="/${ resources.app.locals.adminPath }/content/crons"  class="ts-button ts-ajax-button ">${ obj.active }</a>`; 
						jsontablehtml += '</td>';
						jsontablehtml += `<td><a href="/${ resources.app.locals.adminPath }/content/crons/${ obj._id }" class="async-admin-ajax-link">${ obj._id }</a></td>`;
						jsontablehtml += `<td><a href="/${ resources.app.locals.adminPath }/content/crons/${ obj._id }/" class="async-admin-ajax-link">edit</a>`;
						jsontablehtml += ` | <a alt="delete" data-ajax-method="delete" class=" ts-dialog-delete" data-href="/${ resources.app.locals.adminPath }/content/crons/${ obj._id }/" data-deleted-redirect-href="/${ resources.app.locals.adminPath }/content/crons">delete</a>`;
						jsontablehtml += ` | <a alt="fire" data-ajax-method="get" class="ts-dialog-delete" data-href="/${ resources.app.locals.adminPath }/content/cron/${ obj._id }/run">run</a>`;
						jsontablehtml += ` | <a alt="validate" data-ajax-method="get" class="ts-dialog-delete" data-href="/${ resources.app.locals.adminPath }/content/cron/${ obj._id }/validate">validate</a>`;
						jsontablehtml += '</td>';
						return jsontablehtml;
					}
				};
			}
		}
	};
};