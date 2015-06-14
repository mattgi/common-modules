angular.module('app.modules.modal.directives')
  .directive('modalConfirm', [
    function() {
      return {
        restrict: 'A',
        scope: {
          actionOk: '&modalOk',
          actionCancel: '&modalCancel'
        },
        link: function (scope, element, attr) {
          var msg = attr.modalConfirm || 'Are you sure?';
          element.bind('click', function () {
            bootbox.confirm(msg, function (result) {
              if (result) {
                scope.$apply(scope.actionOk);
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
