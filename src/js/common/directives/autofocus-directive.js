angular.module('app.modules.common.directives')
  .directive('autoFocus', ['$timeout', function($timeout) {
  return {
    link: {
      post: function postLink(scope, element) {
        $timeout(function () {
          element[0].focus();
        }, 100);
      }
    }
  };
}]);