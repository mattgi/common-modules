angular.module('app.modules.authentication.controllers').controller('SignupController', [
  '$scope',
  '$state',
  '$auth',
  '$notification',
  function($scope, $state, $auth, $notification) {
    'use strict';

    $scope.signup = function() {
      $auth.signup({
        displayName: $scope.displayName,
        email: $scope.email,
        password: $scope.password ? $scope.password : undefined
      }).catch($notification.error);
    };
  }
]);
