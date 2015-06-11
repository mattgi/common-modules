angular.module('app.modules.common.directives')
  .directive('chartStackedBar', [
    'ChartJsFactory',
    function(ChartJsFactory) {
      return new ChartJsFactory('StackedBar');
    }
  ]
);
