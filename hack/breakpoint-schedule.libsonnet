{
  authentication: {

    'K6/api/tests/authentication/consent/breakpoint.yaml': {
      '0 08 * * 1': 'yt01-post-consent-break',  // “At 08:00 on Monday.”
    },


    '0 10 * * 1': 'yt01-for-org-with-a2-break',  //  “At 10:00 on Monday.”
    '0 12 * * 1': 'yt01-for-system-user-break',  //  “At 12:00 on Monday.”
    '0 14 * * 1': 'yt01-for-user-break',  //  “At 14:00 on Monday.”


    'K6/api/tests/authentication/pdp-authorize/breakpoint.yaml': {
      '0 4 * * 2': 'yt01-enduser-break',  //  “At 04:00 on Tuesday.”
      '20 4 * * 2': 'yt01-dagl-break',  //  “At 04:20 on Tuesday.”
      '40 4 * * 2': 'yt01-dagl-direct-delegation-break',  //  “At 04:40 on Tuesday.”
      '0 5 * * 2': 'yt01-dagl-deny-break',  //  “At 05:00 on Tuesday.”
    },


    'K6/api/tests/authentication/connections/breakpoint.yaml': {
      '20 5 * * 2': 'yt01-get-connections-to-break',  //  “At 05:20 on Tuesday.”
      '40 5 * * 2': 'yt01-get-connections-from-break',  //  “At 05:40 on Tuesday.”
    },


    '0 6 * * 2': 'yt01-get-access-packages-to-break',  //  “At 06:00 on Tuesday.”
    '20 6 * * 2': 'yt01-get-access-packages-from-break',  //  “At 06:20 on Tuesday.”


    'K6/api/tests/authentication/roles/breakpoint.yaml': {
      '40 4 * * 3': 'yt01-get-roles-break',  //  “At 04:40 on Wednesday.”
    },

    'K6/api/tests/authentication/get-authorized-parties/breakpoint.yaml': {
      '0 5 * * 3': 'yt01-for-user-avgiver-liste-break',  //  “At 05:00 on Wednesday.”
      '20 5 * * 3': 'yt01-for-user-dialogporten-break',  //  “At 05:20 on Wednesday.”
      '40 5 * * 3': 'yt01-for-user-dialogporten-with-filter-break',  //  “At 05:40 on Wednesday.”
      '0 6 * * 3': 'yt01-for-user-include-parties-via-key-role-break',  // “At 06:00 on Wednesday.”
    },


  },
  dialogporten: {
    'K6/api/tests/dialogporten/serviceowner/breakpoint.yaml': {

    },
  },
  portaler: {
    'K6/api/tests/portaler/breakpoint.yaml': {

    },
  },
}
