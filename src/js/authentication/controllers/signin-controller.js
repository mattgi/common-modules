angular.module('app.modules.authentication.controllers').controller('SigninController', [
  '$scope',
  '$state',
  '$account',
  '$auth',
  '$notification',
  'satellizer.config',
  '$config',
  function($scope, $state, $account, $auth, $notification, sat, $config) {
    'use strict';

    sat.loginUrl = $config.uri.auth.signin;

    $scope.signin = function() {
      var model = { email: $scope.email, password: $scope.password, isAdmin: $state.current.data.auth.app === 'admin' };
      $auth.login(model).then(function() {
        $account.refresh(function() {
          $notification.success('Welcome ' + $account.me.name + '. You have successfully signed in');
        });
      }).catch($notification.error);
    };

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider).then(function() {
        $account.refresh(function() {
          $notification.success('Welcome ' + $account.me.name + '. You have successfully signed in');
        });
      }).catch($notification.error);
    };
  }
]);
