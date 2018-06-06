'use strict';
const periodic = require('periodicjs');
const reactappLocals = periodic.locals.extensions.get('periodicjs.ext.reactapp');
const reactapp = reactappLocals.reactapp();
const cronExample = require('../components/cron_example');

module.exports = {
  containers: {
    [`${reactapp.manifest_prefix}extension/crons/add`]  : {
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
                paddingTop: '50px',
              },
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
                          url:'/extension/crons/add?format=json&unflatten=true&updateprofile=true&updatecallback=true&handleupload=true&forcequerytobody=true&encryptfiles=true',
                          options:{
                            method:'POST',
                          },
                          success: true,
                          successCallback: 'func:this.props.reduxRouter.push',
                        },
                        flattenFormData: true,
                        footergroups: false,
                        formgroups:[
                          {
                            formElements: [
                              {
                                label: 'Name',
                                name: 'name',
                              },
                              {
                                label: 'Theme',
                                name: 'theme',
                              },
                            ],
                          },
                          {
                            formElements: [
                              {
                                label: 'Interval',
                                name: 'cron_interval',
                              },
                            ],
                          },
                          {
                            formElements: [
                              {
                                type: 'file',
                                label: 'Upload Script',
                                name: 'cron_file',
                              },
                              {
                                type: 'layout',
                                value: {
                                  component: 'div',
                                  children:' ',
                                },
                              },
                            ],
                          },
                          {
                            formElements: [
                              {
                                type: 'datalist',
                                datalist: {
                                  // resourceUrl: '/contentdata/standard_crons?format=json',
                                  resourceUrl: '/extension/crons/internal-functions?format=json',
                                  selector: '_id',
                                  entity: 'internal_function',
                                  // returnProperty:'_id',
                                },
                                label:'Internal Function',
                                name:'internal_function',
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
                          {
                            formElements: [
                              {
                                type: 'layout',
                                value: {
                                  component: 'div',
                                  props: {
                                    dangerouslySetInnerHTML: {
                                      __html:cronExample,
                                    },
                                  },
                                },
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
          }, ],
        }, ],
      },
      'resources': {
        // formdata: `${reactapp.manifest_prefix}extension/crons/internal-functions?format=json`,
        formdata: `/extension/crons/internal-functions?format=json`,
      },
      'onFinish': 'render',
    },
  },
};