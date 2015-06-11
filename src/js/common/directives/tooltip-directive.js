angular.module('app.modules.common.directives')
  .directive('tip', [
    '$timeout',
    function($timeout) {
      return {
        restrict: 'C',
        link: function (s$cope, $element, attrs) {
          $element.tooltip({
            placement: 'bottom'
          }).on('shown.bs.tooltip', function () {
            $(this).next('.tooltip').find('.tooltip-arrow').css('top', 0);
          });
        }
      };
    }
  ]
);
