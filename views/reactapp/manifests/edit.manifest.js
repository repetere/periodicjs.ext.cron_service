'use strict';
const path = require('path');

module.exports = (periodic) => {
  // let reactadmin = periodic.app.controller.extension.reactadmin;
// const path = require('path');
// const periodic = require('periodicjs');
// let reactapp = periodic.locals.extensions.get('periodicjs.ext.reactapp').reactapp();
const reactappLocals = periodic.locals.extensions.get('periodicjs.ext.reactapp');
const reactapp = reactappLocals.reactapp();

  return {
    containers: {
      [`${reactapp.manifest_prefix}extension/crons/:id`]  : {
        'layout': {
          'component': 'Hero',
          'props': {
            'size': 'isFullheight',
          },
          'children': [{
            'component': 'HeroBody',
            'props': {},
            'children': [{
              'component': 'Container',
              'props': {
                style: {
                  paddingTop: '50px'
                }
              },
              'children': [{
                'component': 'Columns',
                'children': [{
                  'component': 'Column',
                  'props': {
                    'size': 'is1',
                  },
                },
                {
                  'component': 'Column',
                  'props': {},
                  'children': [{
                    'component': 'Title',
                    'props': {
                      'style': {
                        'textAlign': 'center',
                      },
                    },
                    'children': 'Edit Cron',
                  }, 
                  {
                    component: 'ResponsiveCard',
                    children: [
                      {
                        component: 'ResponsiveForm',
                        props: {
                          onSubmit:{
                            url:`${reactapp.manifest_prefix}contentdata/standard_crons/:id?format=json`,
                            options:{
                              method:'PUT',
                            },
                            params: [
                              { 'key': ':id', 'val': '_id', },
                            ],
                            // success: true,
                            successCallback:'func:this.props.refresh',
                          },
                          'hiddenFields':[{
                            'form_name':'docid',
                            'form_val':'_id',
                          }, ],
                          flattenFormData: true,
                          formgroups:[
                            {
                              formElements: [
                                {
                                  label: 'Name',
                                  name: 'name'
                                },
                                {
                                  label: 'Theme',
                                  name: 'theme'
                                },
                              ],
                            },
                            {
                              formElements: [
                                {
                                  label: 'Author',
                                  name: 'author'
                                },
                                {
                                  label: 'Interval',
                                  name: 'cron_interval'
                                },
                              ],
                            },
                            {
                              formElements: [
                                {
                                  label: 'Active',
                                  name: 'active'
                                },
                              ],
                            },
                            {
                              formElements:[
                                {
                                  type:'submit',
                                  value:'Save',
                                },
                                {
                                  type: 'layout',
                                  value: {
                                    component: 'ResponsiveButton',
                                    thisprops: {
                                      onclickPropObject: ['formdata'],
                                    },
                                    props: {
                                      onClick: 'func:this.props.fetchAction',
                                      onclickBaseUrl: '/extension/crons/:id/run',
                                      onclickLinkParams: [
                                        { 'key': ':id', 'val': '_id', },
                                      ],
                                      'fetchProps': {
                                        'method': 'POST',
                                      },
                                      buttonProps: {
                                        size: 'isPrimary',
                                      }
                                    },
                                    'successProps':{
                                      'success':true,
                                      'successCallback':'func:this.props.refresh',
                                    },
                                    children: 'Run',
                                  },
                                }
                              ],
                            },
                          ],
                        },
                        asyncprops: {
                          formdata: ['crondata','data'],
                        },
                      },
                    ],
                  },
                  ],
                },
                {
                  'component': 'Column',
                  'props': {
                    'size': 'is1',
                  },
                },
                ],
              }, ],
            },  ],
          }, ],
        },
        'resources': {
          crondata: `${reactapp.manifest_prefix}contentdata/standard_crons/:id?format=json`,
        },
        'onFinish': 'render',
      },
    },
  };
};