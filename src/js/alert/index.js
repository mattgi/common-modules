angular.module('app.modules.alert.services', []);
angular.module('app.modules.alert', [
  'mgcrea.ngStrap',
  'app.modules.alert.services',
]).config([
  '$alertProvider',
  function($alertProvider) {
    angular.extend($alertProvider.defaults, {
      animation: 'fadeZoomFadeDown',
      placement: 'top'
    });
  }
]).service('$notification', [
  '$alert',
  function($alert) {

    var errorMessage = function(response) {
      var message = 'There was an error performing this request';
      if (response && response.data) {
        message = response.data.err || response.data.message || message;
      }
      if (_.isString(response)) message = response;
      return message;
    };

    this.success = function(message) {
      var model = { type: 'success', duration: 3, content: message };
      $alert(model);
    };

    this.error = function(response) {
      var base = { type: 'danger', duration: 3 };
      if (response.data && typeof response.data.message === 'object') {
        angular.forEach(response.data.message, function(message) {
          var model = angular.extend({}, { content: message[0] }, base);
          $alert(model);
        });
      } else {
        var model = angular.extend({}, { content: errorMessage(response) }, base);
        $alert(model);
      }
    };

    this.warning = function(message) {
      var model = { type: 'warning', duration: 3, content: message };
      $alert(model);
    };

    this.information = function(message) {
      var model = { type: 'info', duration: 3, content: message };
      $alert(model);
    };
  }
]);
