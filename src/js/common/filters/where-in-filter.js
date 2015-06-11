angular.module('app.modules.common.filters')
  .filter('whereIn', function() {
    return function(array, subset, key) {
      key = key || 'id';
      return _.filter(array, function(item) {
        if (_.isObject(item)) {
          return (_.contains(subset, item[key])) ||
                 (_.contains(subset, item[key].toString()));
        } else {
          return (_.contains(subset, item)) ||
                 (_.contains(subset, item.toString()));
        }
      });
    };
  });
