angular.module('app.modules.logging.services')
  .factory('$applicationLoggingService', [
    '$log',
    'loggingUtilsService',
    function($log, loggingUtilsService) {

      return {
        error: function(message) {
          $log.error.apply($log, arguments);
          loggingUtilsService.sendToServer('error', message, null, null);
        },

        debug: function(message){
          $log.log.apply($log, arguments);
          loggingUtilsService.sendToServer('debug', message, null, null);
        }
      };
    }
  ]
);
