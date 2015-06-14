angular.module('app.modules.logging.services')
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
