angular.module('app.modules.authentication.services')
  .factory('$account', [
    '$rootScope',
    '$notification',
    '$http',
    '$state',
    '$utils',
    '$auth',
    '$config',
    function($rootScope, $notification, $http, $state, $utils, $auth, $config) {

      var svc = {

        accountRefreshInProgress: false,

        initialized: false,

        me: null,

        url: $config.uri.api + '/me',

        hasPermission: function(permission) {
          if (svc.me && svc.me.permissions) {
            return _.contains(svc.me.permissions, permission);
          }

          return false;
        },

        clear: function(next) {
          svc.me = undefined;
          svc.initialized = false;
          $auth.removeToken();
          if (next) return next();
        },

        refresh: function(next) {
          svc.accountRefreshInProgress = true;
          $http.get(svc.url)
            .success(function (data) {
              svc.me = data;
              svc.initialized = true;
              svc.accountRefreshInProgress = false;
              if (next) return next();
            })
            .error(function(data, status) {
              svc.me = undefined;
              svc.initialized = false;
              svc.clear(function() {
                if ($state.get('dashboard')) $state.go('dashboard');
                $state.go('app');

                $notification.warning('The previously signed in user cannot be found. Please sign in again.');
                svc.accountRefreshInProgress = false;
                if (next) return next();
              });
            });
        }
      };

      return svc;
    }
  ]
);
