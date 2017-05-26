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
                          limit: 10,
                          numItems: 10,
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
                              label: 'Date',
                              sortid: 'createdat',
                              momentFormat: 'MM/DD/YYYY | hh:mm:ssA',
                              sortable: true,
                            }, {
                              label: 'Name',
                              sortid: 'name',
                              sortable: false,
                              columnProps:{
                                style:{
                                  maxWidth:200,
                                },
                              },
                            }, {
                              label: 'Theme',
                              sortid: 'theme',
                              columnProps:{
                                style:{
                                  maxWidth:200,
                                },
                              },
                              sortable: false,
                            }, {
                              label: 'Interval',
                              sortid: 'cron_interval',
                              sortable: false,
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