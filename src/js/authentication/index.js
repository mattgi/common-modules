angular.module('app.modules.authentication.services', []);
angular.module('app.modules.authentication.controllers', []);
angular.module('app.modules.authentication.directives', []);
angular.module('app.modules.authentication', [
  'ui.router',
  'satellizer',
  'app.services', // This currently relies on gulp task creating a config.js file
  'app.modules.common.services',
  'app.modules.alert',
  'app.modules.authentication.services',
  'app.modules.authentication.controllers',
  'app.modules.authentication.directives'
]).config([
  '$authProvider',
  '$configProvider',
  function($authProvider, $configProvider) {
    var $config = $configProvider.$get();

    configSatellizer($authProvider, $config.satellizer);

    $authProvider.tokenPrefix = 'auth';
  }
]).run([
  '$rootScope',
  '$window',
  '$auth',
  '$account',
  '$state',
  '$utils',
  '$config',
  function($rootScope, $window, $auth, $account, $state, $utils, $config) {

    $rootScope.goToPrevious = function(defaultState) {
      if ($state.previousState && $state.previousState.name.length > 0) {
        $state.go($state.previousState.name, $state.previousState.params);
      } else if (defaultState) {
        $state.go(defaultState);
      } else {
        if ($state.get('dashboard')) $state.go('dashboard');
        $state.go('app');
      }
    };

    $rootScope.$on('$stateChangeSuccess',  function(event, toState, toParams, fromState, fromParams) {
      $rootScope.bodyClass = toState.name;
      if (!$state.previousState) {
        $state.previousState = {};
      }
      $state.previousState.name = fromState.name;
      $state.previousState.params = fromParams;

      //TODO: refactor hacky string matching.
      if ($auth.isAuthenticated() && !$account.initialized && !_.contains(['signin', 'forbidden'], toState.name)) {
        $account.refresh();
      }
    });

    $rootScope.redirectState = function(options) {
      if (_.some([
        angular.isUndefined(options),
        angular.isUndefined(options.stateName),
        angular.isUndefined(options.event),
        angular.isUndefined(options.fromState),
        angular.isUndefined(options.fromParams),
        angular.isUndefined(options.refreshAccount)
      ])) {
        throw new Error('Missing required option.');
      }

      options.event.preventDefault();

      var redirection = $state.get(options.stateName);

      //nb. fromState will actually be posted as the initialled requested toState.
      if (!redirection) {
        $utils.navigate($config.uri.app + '/');
      } else if (options.refreshAccount) {
        $account.refresh(function () {
          $state.go(redirection.name, {}, { notify: false }).then(function () {
            $rootScope.$broadcast('$stateChangeSuccess', redirection, null, options.fromState, options.fromParams);
          });
        });
      } else {
        $state.go(redirection.name, {}, { notify: false }).then(function () {
          $rootScope.$broadcast('$stateChangeSuccess', redirection, null, options.fromState, options.fromParams);
        });
      }
    };

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams /*, fromState, fromParams */) {
      var options = { event: event, fromState: toState, fromParams: toParams, refreshAccount: false };
      var auth;
      if (toState && toState.data && toState.data.auth) {
        auth = toState.data.auth;
      }

      if ($auth.isAuthenticated()) {
        if (auth && auth.redirectTo && auth.redirectIfAuthenticated) {
          // redirect to state data defined state
          return $rootScope.redirectState(angular.extend(options, { stateName: auth.redirectTo, refreshAccount: true }));
        } else if (auth && auth.role && auth.role.length > 0) {

          if ($account.initialized) {
            if ($account.me.role !== auth.role) {
              // redirect to forbidden (server handling)
              event.preventDefault();
              if ($state.get('forbidden')) {
                $state.go('forbidden');
              } else {
                $utils.navigateToForbidden();
              }
            }
          } else {
            $account.refresh(function () {
              if ($account.me.role !== auth.role) {
                event.preventDefault();
                if ($state.get('forbidden')) {
                  $state.go('forbidden');
                } else {
                  $utils.navigateToForbidden();
                }
              }
            });
          }
        }
        // else pass-through
      } else if (auth && ((auth.role && auth.role.length === 0) || _.isUndefined(auth.role))) {
        // no permissions required for route, pass through.
      } else {
        // else redirect to signin.
        return $rootScope.redirectState(angular.extend(options, { stateName: 'signin' }));
      }
    });
  }
]);

/**
 * Configure satillizer settings for available providers
 * @param {object} $authProvider
 * @param {object} $providers
 */
function configSatellizer($authProvider, $providers) {
  if ($providers) {
    for (var provider in $providers) {
      if ($authProvider.hasOwnProperty(provider) && 'function' === typeof($authProvider[provider])) {
        $authProvider[provider]($providers[provider]);
      }
    }
  }
}