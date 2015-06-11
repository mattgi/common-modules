angular.module('app.modules.common.directives')
.directive('equals', function() {
  return {
    require: 'ngModel',
    link: function ($scope, $element, $attr, ngModel) {
      if (!$attr.equals) {
        return;
      }
      $scope.$watch($attr.equals, function (value) {
        // only compare values if the second model has a value.
        if (ngModel.$viewValue !== undefined && ngModel.$viewValue !== '') {
          ngModel.$setValidity('equals', value === ngModel.$viewValue);
        }
      });
      ngModel.$parsers.push(function (value) {
        // mute the error if the second model is empty.
        if (value === undefined || value === '') {
          ngModel.$setValidity('equals', true);
          return value;
        }
        var isValid = value === $scope.$eval($attr.equals);
        ngModel.$setValidity('equals', isValid);
        return isValid ? value : undefined;
      });
    }
  };
});