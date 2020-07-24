// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  host: 'https://kormassage.kr:9877',
  //host: 'http://localhost:9877',
  version: 'v1',
  firebase: {
    apiKey: "AIzaSyAQcH8BRO7NR9BtQDuUiNi2dWl-SX1pGBY",
    authDomain: "telepro-dashboard.firebaseapp.com",
    databaseURL: "https://telepro-dashboard.firebaseio.com",
    projectId: "telepro-dashboard",
    storageBucket: "telepro-dashboard.appspot.com",
    messagingSenderId: "198578285365",
    appId: "1:198578285365:web:d6a0d0ee158ef1f6"
  },
};
