angular.module('app.modules.common.services').factory('$socket', [
  '$rootScope',
  '$log',
  '$http',
  '$notification',
  '$applicationLoggingService',
  'socketFactory',
  '$config',
  function($rootScope, $log, $http, $notification, $applicationLoggingService, socketFactory, $config) {
    var apiRoute = $config.uri.api;
    var apiServerRoute = apiRoute.replace('/v1', '');
    var ioSocket = io.connect(apiServerRoute);

    var socket = socketFactory({ ioSocket: ioSocket });
    socket.forward('error');

    socket.on('subscribed', function() {
      console.log('subscribed');
    });

    socket.on('unsubscribed', function() {
      console.log('unsubscribed');
    });

    socket.on('connect', function() {
      console.log('connected');
    });

    socket.on('disconnect', function() {
      console.log('disconnected');
    });

    return socket;

  }
]);
