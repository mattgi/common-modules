angular.module('app.admin.controllers').controller('StyleGuideController', [
  '$rootScope',
  '$scope',
  '$state',
  function ($rootScope, $scope, $state) {

    $scope.getColor = function(selector) {
      var rgb = $(selector).css('backgroundColor').match(/\d+/g);
      var hex = '#'+ String('0' + Number(rgb[0]).toString(16)).slice(-2) + String('0' + Number(rgb[1]).toString(16)).slice(-2) + String('0' + Number(rgb[2]).toString(16)).slice(-2);
      return hex;
    };

    $scope.getStyle = function(selector) {
      return {
        'color': $(selector).css('background-color')
      };
    };

  }
]);
