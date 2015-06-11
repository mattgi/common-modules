angular.module('app.modules.authentication.services')
  .service('$utils', [
    '$window',
    '$location',
    function($window, $location) {
      'use strict';

      this.navigateToForbidden = function() {
        $window.location.pathname = '/forbidden';
      };

      this.navigate = function(url, next) {
        if (url.indexOf('http') === 0) {
          $window.location = url;
        } else {
          $location.path(url);
        }

        if (next) {
          next();
        }
      };

      this.capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      };

      this.getDomain = function() {
        var domain = $window.location.hostname;
        if (domain === 'localhost') {
          return domain;
        } else {
          if (domain.split('.').length === 3) {
            domain = domain.split('.').splice(1).join('.');
          }
          domain = '.' + domain;
          return domain;
        }
      };
    }
  ]
);
