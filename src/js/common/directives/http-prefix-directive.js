angular.module('app.modules.common.directives')
  .directive('httpPrefix', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, controller) {

        function ensureHttpPrefix(value) {

          // need to add prefix if we don't have http:// prefix already AND we don't have part of it
          if (value && !/^(http(s)?):\/\//i.test(value) &&
            'http://'.indexOf(value) === -1 &&
            'https://'.indexOf(value) === -1) {
            controller.$setViewValue('http://' + value);
            controller.$render();
            return 'http://' + value;
          } else {
            return value;
          }
        }

        controller.$formatters.push(ensureHttpPrefix);
        controller.$parsers.splice(0, 0, ensureHttpPrefix);
      }
    };
  });