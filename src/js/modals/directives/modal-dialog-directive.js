angular.module('app.modules.modals.directives')
  .directive('modalDialog', [
    '$templateCache',
    '$compile',
    '$q',
    '$http',
    function($templateCache, $compile, $q, $http) {

      var getTemplate = function(templateId) {
        var def = $q.defer();

        var template = $templateCache.get(templateId);
        if (typeof template === 'undefined') {
          $http.get(templateId)
            .success(function(data) {
              $templateCache.put(templateId, data);
              def.resolve(data);
            });
        } else {
          def.resolve(template);
        }
        return def.promise;
      };

      return {
        restrict: 'A',
        scope: {
          title: '@modalTitle',
          buttons: '=modalButtons',
          className: '@modalClassName'
        },
        link: function (scope, element, attr) {
          var msg = '';
          var templateUrl = attr.modalDialogTemplate;
          if (templateUrl) {
            getTemplate(templateUrl).then(function(res) {
              msg = $compile(res)(scope);
            });
          }
          else {
            msg = attr.modalDialog;
          }
          element.bind('click', function () {
            bootbox.dialog({
              message: msg,
              title: scope.title,
              buttons: scope.buttons,
              className: scope.className
            });
            //scope.$apply();
          });
        }
      };
    }
  ]
);
