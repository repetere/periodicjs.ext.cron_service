'use strict';
const path = require('path');

module.exports = (periodic) => {
  let reactadmin = periodic.app.controller.extension.reactadmin;

  return {
    containers: {
      [`${reactadmin.manifest_prefix}extension/crons/add`]: {
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
                    'size': 'is3',
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
                    component: 'ResponsiveForm',
                    props: {
                      onSubmit: {
                        url: '/psa/fileupload/id_photo',
                        options: {
                          method: 'POST',
                        },
                        successProps: '/verification',
                        successCallback: 'func:this.props.reduxRouter.push',
                      },
                      blockPageUI: true,
                      flattenFormData: true,
                      footergroups: false,
                      formgroups: [{
                          gridProps: {
                          },
                          formElements: [{
                            type: 'file',
                            name: 'id_photo',
                          }, ],
                        },
                        {
                          gridProps: {
                            className: '__cis_submit_wrapper',
                          },
                          formElements: [

                            {
                              type: 'submit',
                              value: 'Submit & Continue',
                              layoutProps: {
                                size: 'isNarrow',
                                className: '__cis_submit_btn',
                              },
                              passProps: {
                                size: 'isLarge',
                                className: '__cis_arrow_right',
                              },
                            },
                          ],
                        },
                      ],
                    },
                  },
                  ],
                },
                {
                  'component': 'Column',
                  'props': {
                    'size': 'is3',
                  },
                },
                ],
              }, ],
            },  ],
          }, ],
        },
        'resources': {
          // oauth2data: `${reactadmin.manifest_prefix}api/oauth2async/authorize?format=json`,
        },
        'onFinish': 'render',
      },
    },
  };
};