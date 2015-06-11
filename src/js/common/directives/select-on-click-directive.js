angular.module('app.modules.common.directives')
  .directive('selectOnClick', [
    function() {
      return function (scope, element) {
        element.bind('click', function () {
          this.select();
        });
      };
    }
  ]
);
