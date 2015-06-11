angular.module('app.modules.authentication.controllers').controller('ProviderController', [
  '$scope',
  '$auth',
  'satellizer.config',
  '$config',
  '$notification',
  function($scope, $auth, sat, $config, $notification) {
    'use strict';

    if ($config.facebook) {
      sat.facebook({
        clientId: $config.facebook.clientId
      });
    }

    $scope.link = function(provider, next) {
      $auth.link(provider).then(function() {
        $notification.success('You have successfully linked ' + provider + ' account');
        return next();
      }).catch(function(response) {
        $notification.error(response);
        return next(true);
      });
    };

    $scope.unlink = function(provider, next) {
      $auth.unlink(provider).then(function() {
        $notification.success('You have successfully unlinked ' + provider + ' account');
        return next();
      }).catch(function(response) {
        var message = response.data ? response.data.message : 'Could not unlink ' + provider + ' account';
        $notification.error(message);
        return next(new Error(message));
      });
    };

  }
]);
