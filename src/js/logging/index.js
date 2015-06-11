var loggingModule = angular.module('app.modules.logging', []);

/**
 * Logging utilities for stack trace handling & sending to server.
 */
loggingModule
  .factory('loggingUtilsService', [
    '$log',
    '$window',
    function($log, $window) {
      return {
        printStackTrace: function(parameters) {
          return $window.printStackTrace(parameters);
        },

        sendToServer: function(type, message, stackTrace, cause) {

          var processErrorQueue = function() {

            while ($window.errorQueue.length > 0) {
              errorData = $window.errorQueue.shift();

              try {
                // send the log details to the server using jQuery - help prevent circular $http errors!
                $.ajax({
                  type: 'POST',
                  url: '/v1/logs',
                  contentType: 'application/json',
                  headers: {
                    // we may want to add in the auth token as this is not using $http
                  },
                  data: errorData
                });
              } catch (loggingError) {
                $log.warn('Error server-side logging failed');
                $log.log(loggingError);
              }
            }
          };

          var errorData = angular.toJson({
            browser: new BrowserCheck('log').getBrowserDetails(),
            url: $window.location.href,
            type: type,
            message: message,
            stackTrace: stackTrace,
            cause: cause
          });

          if (!$window.errorQueue) {
            $window.errorQueue = [];
          }

          // check if error already in the queue...
          if (!_.contains($window.errorQueue, errorData)) {
            $window.errorQueue.push(errorData);
          }

          // debounce the sending of the errors
          clearTimeout(this.sendErrorsDebounce);
          this.sendErrorsDebounce = setTimeout(processErrorQueue, 2000);
        }
      };
    }
  ]
);

/**
 * Override built in exception handler, to use our new logging service.
 */
loggingModule
  .factory('$exceptionHandler', [
    '$log',
    '$window',
    'loggingUtilsService',
    function ($log, $window, loggingUtilsService) {

      return function(exception, cause) {

        cause = cause || '';

        // preserve the default behaviour which will log the error
        // to the console, and allow the application to continue running.
        $log.error.apply($log, arguments);

        // grab the error message and stackTrace then send to our server
        var errorMessage = exception.toString();
        var stackTrace = loggingUtilsService.printStackTrace({e: exception});
        loggingUtilsService.sendToServer('exception', errorMessage, stackTrace, cause || '');
      };
    }
  ]
);

/**
 * Application Logging Service to give us a way of logging
 * error / debug statements from the client to the server.
 */
loggingModule
  .factory('$applicationLoggingService', [
    '$log',
    'loggingUtilsService',
    function($log, loggingUtilsService) {

      return {
        error: function(message) {
          // preserve default behaviour
          $log.error.apply($log, arguments);

          // send to our server
          loggingUtilsService.sendToServer('error', message, null, null);
        },

        debug: function(message){
          $log.log.apply($log, arguments);

          // send to our server
          loggingUtilsService.sendToServer('debug', message, null, null);
        }
      };
    }
  ]
);
