'use strict';
const path = require('path');

module.exports = (periodic) => {
  let reactadmin = periodic.app.controller.extension.reactadmin;

  return {
    containers: {
      [`${reactadmin.manifest_prefix}extension/crons`]: {
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
                'children': [
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
                    'children': 'Crons',
                  }, {
                    component: 'ResponsiveButton',
                    props: {
                      onClick: 'func:this.props.reduxRouter.push',
                      onclickBaseUrl: '/extension/cron/add',
                      buttonProps: {
                        size: 'isPrimary',
                      }
                    },
                    children: 'Add Cron',
                  },
                  {
                    component: 'ResponsiveCard',
                    props: {
                      cardTitle: 'Crons',
                    },
                    children: [
                      {
                        component: 'ResponsiveTable',
                        props: {
                          flattenRowData: true,
                          filterSearch: true,
                          suppressNullValues: true,
                          tableSearch: true,
                          limit: 50,
                          numItems: 50,
                          numPages: 1,
                          hasPagination: true,
                          headerLinkProps: {
                            style: {
                              textDecoration: 'none',
                              color: '#414141',
                            },
                          },
                          headers: [
                            {
                              label: 'ID',
                              sortid: '_id',
                              sortable: true,
                              link: {
                                baseUrl: '/extension/crons/:id',
                                params: [
                                  {
                                    key: ':id',
                                    val: '_id',
                                  },
                                ],
                              },
                              linkProps: {
                                style: {
                                  textDecoration: 'none',
                                },
                              },
                            },
                            {
                              label: 'Date',
                              sortid: 'createdat',
                              momentFormat: 'MM/DD/YYYY',
                              sortable: true,
                            },
                            {
                              label: 'Name',
                              sortid: 'name',
                              sortable: false,
                              columnProps:{
                                style:{
                                  maxWidth:200,
                                },
                              },
                            }, 
                            {
                              label: 'Theme',
                              sortid: 'theme',
                              sortable: false,
                            }, 
                            {
                              label: 'Active',
                              sortid: 'active',
                              sortable: false,
                            }, 
                            {
                              label: 'Interval',
                              sortid: 'cron_interval',
                              sortable: false,
                            }, 
                            {      
                              label: ' ',
                              buttons: [{
                                children: 'Activate',  
                                passProps: {
                                  buttonProps: {
                                    color: 'isSuccess',
                                  },
                                  onClick: 'func:this.props.fetchAction',
                                  onclickBaseUrl: '/crons/setactive/:id/:status',
                                  onclickLinkParams: [
                                    { 'key': ':id', 'val': '_id', },
                                    { 'key': ':status', 'val': 'active'}
                                  ],
                                  'fetchProps': {
                                    'method': 'POST',
                                  },
                                  'successProps':{
                                    'success':true,
                                    'successCallback':'func:this.props.refresh',
                                  },
                                },
                              },
                              {
                                children: 'Validate',  
                                passProps: {
                                  buttonProps: {
                                    color: 'isInfo',
                                  },
                                  onClick: 'func:this.props.fetchAction',
                                  onclickBaseUrl: '/cron/:id/validate',
                                  onclickLinkParams: [
                                    { 'key': ':id', 'val': '_id', },
                                  ],
                                  'fetchProps': {
                                    'method': 'GET',
                                  },
                                  'successProps':{
                                    'success':true,
                                    'successCallback':'func:this.props.refresh',
                                  },
                                },
                              },
                              {
                                children: 'Test',  
                                passProps: {
                                  buttonProps: {
                                    color: 'isWarning',
                                  },
                                  onClick: 'func:this.props.fetchAction',
                                  onclickBaseUrl: '/cron/:id/mocha',
                                  onclickLinkParams: [
                                    { 'key': ':id', 'val': '_id', },
                                  ],
                                  'fetchProps': {
                                    'method': 'GET',
                                  },
                                  'successProps':{
                                    'success':true,
                                    'successCallback':'func:this.props.refresh',
                                  },
                                },
                              },
                              ],
                            },
                            {      
                              label: ' ',
                              buttons: [{
                                children: 'Remove',  
                                passProps: {
                                  buttonProps: {
                                    color: 'isDanger',
                                  },
                                  onClick: 'func:this.props.fetchAction',
                                  onclickBaseUrl: '/crons/:id',
                                  onclickLinkParams: [{ 'key': ':id', 'val': '_id', }],
                                  'fetchProps': {
                                    'method': 'DELETE',
                                  },
                                  'successProps':{
                                    'success':true,
                                    'successCallback':'func:this.props.refresh',
                                  },
                                },
                              },
                              ],
                            },
                          ]
                        },
                        asyncprops: {
                          'rows': [
                            'crondata', 'crons',
                          ],
                        },
                      },
                    ],
                  }],
                  },
                ],
              }, ],
            },  ],
          }, ],
        },
        'resources': {
          crondata: `${reactadmin.manifest_prefix}crons/view/all?format=json`,
        },
        'onFinish': 'render',
      },
    },
  };
};