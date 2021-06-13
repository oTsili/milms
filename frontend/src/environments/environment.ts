// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl:
    'http://ingress-nginx-controller.kube-system.svc.cluster.local(api)/api',
  AUTH_BASE_URL: 'http://localhost:3000',
  ASSIGNMENT_BASE_URL: 'http://localhost:4000',
  COURSES_BASE_URL: 'http://localhost:4000',
  // AUTH_BASE_URL: 'http://localhost:3000',
  // ASSIGNMENT_BASE_URL: 'http://localhost:4000',
  // COURSES_BASE_URL: 'http://localhost:4000',
  TOTAL_COURSES: 0,
  COURSES_PER_PAGE: 5,
  CURRENT_PAGE: 1,
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
