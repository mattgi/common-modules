angular.module('app.modules.modal.directives')
  .directive('modalPrompt', [
    function() {
      return {
        restrict: 'A',
        scope: {
          actionOk: '&modalOk',
          actionCancel: '&modalCancel'
        },
        link: function (scope, element, attr) {
          var msg = attr.modalPrompt || 'Are you sure?';
          element.bind('click', function () {
            bootbox.prompt(msg, function (result) {
              if (result !== null) {
                scope.$apply(function() { scope.actionOk({result: result}); });
              }
              else {
                scope.$apply(scope.actionCancel);
              }
            });
          });
        }
      };
    }
  ]
);
