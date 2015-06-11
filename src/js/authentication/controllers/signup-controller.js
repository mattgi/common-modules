angular.module('app.modules.authentication.controllers').controller('SignupController', [
  '$scope',
  '$state',
  '$auth',
  'satellizer.config',
  '$notification',
  function($scope, $state, $auth, sat, $notification) {
    'use strict';

    sat.signupUrl = $config.uri.auth.signup;

    $scope.signup = function() {
      $auth.signup({
        displayName: $scope.displayName,
        email: $scope.email,
        password: $scope.password ? $scope.password : undefined
      }).catch($notification.error);
    };
  }
]);
