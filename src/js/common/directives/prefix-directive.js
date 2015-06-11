angular.module('app.modules.common.directives')
  .directive('prefix', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, controller) {

        var prefix = attrs.prefix;

        function ensurePrefix(value) {

          // need to add prefix if we don't have it and we don't have part of it
          if (value && !value.match('^'+prefix) &&
            prefix.indexOf(value) === -1) {
            controller.$setViewValue(prefix + value);
            controller.$render();
            return prefix + value;
          } else {
            return value;
          }
        }

        controller.$formatters.push(ensurePrefix);
        controller.$parsers.splice(0, 0, ensurePrefix);
      }
    };
  });