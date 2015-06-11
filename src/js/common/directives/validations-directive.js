angular.module('app.modules.common.directives')
  .directive('validations', [
    function() {
      return {

        restrict: 'A',

        link: function(scope, element) {
          // form names should be in the format `forms.formName` (e.g. forms.userForm)
          var formPath = element.attr('name') || element.attr('id');
          formPath = formPath.split('.');
          var watches = {};

          function showValidation($formGroup) {
            var $input = $formGroup.find('input[ng-model]:not(.manual-save), textarea[ng-model]:not(.manual-save)');

            if ($input.length > 0) {
              var inputName = $input.attr('name');
              if (!inputName) return;

              var applyError = function(isPristine, isValid) {
                if (!isPristine && isValid !== undefined) {
                  $formGroup.toggleClass('has-error', !isValid);
                }
              };

              var validWatch = formPath.concat([ inputName, '$valid' ]);
              var pristineWatch = formPath.concat([ inputName, '$pristine' ]);

              watches[validWatch.join('-')] = scope.$watch(validWatch.join('.'), function() {
                // remove the watch if the form is no longer in scope.
                if (_.isUndefined(scope[formPath[0]][formPath[1]])) {
                  watches[validWatch.join('-')]();
                  return;
                }
                var isValid = scope[formPath[0]][formPath[1]][inputName].$valid;
                var isPristine = scope[formPath[0]][formPath[1]][inputName].$pristine;
                applyError(isPristine, isValid);
              });

              watches[pristineWatch.join('-')] = scope.$watch(pristineWatch.join('.'), function() {
                // remove the watch if the form is no longer in scope.
                if (_.isUndefined(scope[formPath[0]][formPath[1]])) {
                  watches[pristineWatch.join('-')]();
                  return;
                }

                var isValid = scope[formPath[0]][formPath[1]][inputName].$valid;
                var isPristine = scope[formPath[0]][formPath[1]][inputName].$pristine;
                applyError(isPristine, isValid);
              });
            }
          }

          if (element.prop('tagName').toUpperCase() === 'FORM') {
            element.find('.form-group').each(function(i, formGroup) {
              var $formGroup = angular.element(formGroup);
              if ($formGroup.find('.form-group').length > 0) {
                return;
              }

              showValidation($formGroup);
            });
          }

        }
      };
    }
  ]
);
