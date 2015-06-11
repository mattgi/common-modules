angular.module('app.modules.authentication.controllers').controller('PasswordController', [
  '$scope',
  '$state',
  '$account',
  '$auth',
  '$http',
  '$notification',
  '$config',
  function($scope, $state, $account, $auth, $http, $notification, $config) {
    'use strict';

    $scope.isReset = $state.current.name !== 'forgot-password';

    $scope.forgot = function() {
      var model = { email: $scope.email, isAdmin: $state.current.data.auth.app === 'admin' };
      $http.post($config.uri.auth.forgot, model).then(function() {
        $notification.success('Please check your email for further intructions.');
      }).catch($notification.error);
    };

    $scope.resetRequest = function() {
      var model = { email: $scope.email, isAdmin: $state.current.data.auth.app === 'admin' };
      var uri = [ $config.uri.auth.reset, $state.params.emailToken, $state.params.resetToken ].join('/');
      $http.get(url).then(function(response) {
        $scope.email = response.data.user.email;
      }).catch(function(err) {
        $notification.error(err);
        $state.go('signin');
      });
    };

    $scope.reset = function() {
      var model = { email: $scope.email, password: $scope.password, isAdmin: $state.current.data.auth.app === 'admin' };
      $http.post($config.uri.auth.reset, model).then(function() {
        $auth.login(model).then(function() {
          $account.refresh(function() {
            $notification.success('Welcome back ' + $account.me.name + '. You have successfully reset your password.');
          });
        }).catch($notification.error);
      }).catch($notification.error);
    };

    if ($scope.isReset) {
      $scope.resetRequest();
    }

  }
]);
