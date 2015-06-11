angular.module('app.modules.common.directives')
.directive('formControl', [
  '$animate',
  function($animate) {
    return {
      restrict: 'C',

      require: '?ngModel',

      link: function($scope, $element) {
        if (!$element.hasClass('no-label')) {
          var $parent = $element.closest('.form-group'); // can't use parent due to potential .input-groups.

          var labelMaker = function(newValue) {
            var $label = $parent.find('.placeholder-label');
            if (!newValue || newValue === '') {
              if ($label.length > 0) {
                $animate.leave($label);
              }
            } else {
              if ($label.length === 0) {
                var $newLabel = $('<label class="placeholder-label placeholder-label-'+$element.prop('tagName').toLowerCase()+'">' + $element.attr('placeholder') + '</label>');
                $animate.enter($newLabel, $parent);
              }
            }
          };

          //NB. We watch the element value as invalid values are not always persisted to the model.
          $scope.$watch(function() { return $element.val(); }, labelMaker);
        }
      }
    };
  }
]);
