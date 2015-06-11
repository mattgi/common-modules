var errorMessage = function(response) {
  var message = 'There was an error performing this request';
  if (response && response.data) {
    message = response.data.err || response.data.message || message;
  }
};

angular.module('app.modules.authentication.services', []);
angular.module('app.modules.authentication.controllers', []);
angular.module('app.modules.authentication.directives', []);
angular.module('app.modules.authentication', [
  'ui.router',
  'satellizer',
  'app.modules.common.services',
  'app.modules.alert',
  'app.modules.authentication.services',
  'app.modules.authentication.controllers',
  'app.modules.authentication.directives'
]).config([
  '$authProvider',
  function($authProvider) {
    $authProvider.tokenPrefix = 'auth';
    $authProvider.facebook({
      clientId: '1610795072499821'
    });
  }
]).controller('SigninController', [
  '$scope',
  '$state',
  '$account',
  '$auth',
  '$notification',
  'satellizer.config',
  '$config',
  function($scope, $state, $account, $auth, $notification, sat, $config) {
    sat.loginUrl = $config.uri.auth + '/signin';

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
]).controller('PasswordController', [
  '$scope',
  '$state',
  '$account',
  '$auth',
  '$http',
  '$notification',
  '$config',
  function($scope, $state, $account, $auth, $http, $notification, $config) {
    $scope.isReset = $state.current.name !== 'forgot-password';

    $scope.forgot = function() {
      var model = { email: $scope.email, isAdmin: $state.current.data.auth.app === 'admin' };
      $http.post($config.uri.auth + '/forgot-password', model).then(function() {
        $notification.success('Please check your email for further intructions.');
      }).catch($notification.error);
    };

    $scope.resetRequest = function() {
      var model = { email: $scope.email, isAdmin: $state.current.data.auth.app === 'admin' };
      $http.get($config.uri.auth + '/reset-password/' + $state.params.emailToken + '/' + $state.params.resetToken).then(function(response) {
        $scope.email = response.data.user.email;
      }).catch(function(err) {
        $notification.error(err);
        $state.go('signin');
      });
    };

    $scope.reset = function() {
      var model = { email: $scope.email, password: $scope.password, isAdmin: $state.current.data.auth.app === 'admin' };
      $http.post($config.uri.auth + '/reset-password', model).then(function() {
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
]).controller('SignoutController', [
  '$scope',
  '$account',
  '$auth',
  '$notification',
  function($scope, $account, $auth, $notification) {
    $scope.signout = function() {
      if (!$auth.isAuthenticated()) return;
      $auth.logout().then(function() {
        $account.clear();
        $notification.success('You have successfully signed out');
      });
    };
  }
]).controller('SignupController', [
  '$scope',
  '$state',
  '$auth',
  'satellizer.config',
  '$notification',
  function($scope, $state, $auth, sat, $notification) {
    sat.signupUrl = $config.uri.auth + '/signup';
    $scope.signup = function() {
      $auth.signup({
        displayName: $scope.displayName,
        email: $scope.email,
        password: $scope.password ? $scope.password : undefined
      }).catch($notification.error);
    };
  }
]).controller('ProviderController', [
  '$scope',
  '$auth',
  '$notification',
  function($scope, $auth, $notification) {
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
        } else if (auth && auth.permissions && auth.permissions.length > 0) {

          if ($account.initialized) {
            if (_.intersection($account.me.permissions, auth.permissions).length === 0) {
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
              if (_.intersection($account.me.permissions, auth.permissions).length === 0) {
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
      } else if (auth && auth.permissions && auth.permissions.length === 0) {
        // no permissions required for route, pass through.
      } else {
        // else redirect to signin.
        return $rootScope.redirectState(angular.extend(options, { stateName: 'signin' }));
      }
    });
  }
]);