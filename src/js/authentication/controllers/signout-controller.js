angular.module('app.modules.authentication.controllers').controller('SignoutController', [
  '$scope',
  '$account',
  '$auth',
  '$notification',
  function($scope, $account, $auth, $notification) {
    'use strict';

    $scope.signout = function() {
      if (!$auth.isAuthenticated()) return;
      $auth.logout().then(function() {
        $account.clear();
        $notification.success('You have successfully signed out');
      });
    };
  }
]);
