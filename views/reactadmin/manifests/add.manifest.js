'use strict';
const path = require('path');

module.exports = (periodic) => {
  let reactadmin = periodic.app.controller.extension.reactadmin;

  return {
    containers: {
      [`${reactadmin.manifest_prefix}extension/cron/add`]: {
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
                    'children': 'Add Cron',
                  }, 
                  {
                    component: 'ResponsiveCard',
                    children: [
                      {
                        component: 'ResponsiveForm',
                        props: {
                          onSubmit:{
                            url:'/crons?format=json&unflatten=true&updateprofile=true&updatecallback=true&handleupload=true',
                            options:{
                              method:'POST',
                            },
                            success: true,
                            successCallback: 'func:this.props.reduxRouter.push',
                          },
                          flattenFormData: true,
                          footergroups: false,
                          formgroups:[
                            // {
                            //   formElements: [
                            //     {
                            //       label: 'Name',
                            //       name: 'name'
                            //     },
                            //     {
                            //       label: 'Theme',
                            //       name: 'theme'
                            //     },
                            //   ],
                            // },
                            {
                              formElements: [
                                {
                                  label: 'Interval',
                                  name: 'cron_interval'
                                },
                              ],
                            },
                            {
                              formElements: [
                                {
                                  type: 'file',
                                  label: 'Upload Script',
                                  name: 'cron_file'
                                },
                              ],
                            },
                            {
                              formElements:[
                                {
                                  type:'submit',
                                  value:'Save',
                                },
                              ],
                            },
                          ],
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
          // crondata: `${reactadmin.manifest_prefix}cron/view/:id?format=json`,
        },
        'onFinish': 'render',
      },
    },
  };
};