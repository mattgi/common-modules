angular.module('app.modules.alert.services', []);

angular.module('app.modules.alert', [
  'mgcrea.ngStrap',
  'app.modules.alert.services',
]).config([
  '$alertProvider',
  function($alertProvider) {
    angular.extend($alertProvider.defaults, {
      animation: 'fadeZoomFadeDown',
      placement: 'top'
    });
  }
]);
