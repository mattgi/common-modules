angular.module('app.modules.modals.services')
  .factory('$modal', [
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
        hideAll: function() {
          bootbox.hideAll();
        },
        alert: function(msg) {
          var deferred = $q.defer();
          bootbox.alert(msg, function() {
            deferred.resolve();
          });
          return deferred.promise;
        },
        confirm: function(msg) {
          var deferred = $q.defer();
          bootbox.confirm(msg, function(result) {
            if (result) {
              deferred.resolve();
            }
            else {
              deferred.reject();
            }
          });
          return deferred.promise;
        },
        dialog: function(title, buttons, className, templateUrl, context) {
          var msg = '';
          if (templateUrl) {
            getTemplate(templateUrl).then(function(res) {
              msg = $compile(res)(context);
              bootbox.dialog({
                message: msg,
                title: title,
                buttons: buttons,
                className: className
              });
            });
          }
        },
        prompt: function(msg) {
          var deferred = $q.defer();
          bootbox.prompt(msg, function(result) {
            if (result !== null) {
              deferred.resolve(result);
            }
            else {
              deferred.reject();
            }
          });
          return deferred.promise;
        }
      };
    }
  ]
);
