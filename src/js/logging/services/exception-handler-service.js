angular.module('app.modules.logging.services')
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
