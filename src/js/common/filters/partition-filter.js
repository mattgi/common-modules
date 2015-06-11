angular.module('app.modules.common.filters')
  .filter('partition', ['$cacheFactory', function($cacheFactory) {
    var arrayCache = $cacheFactory('partition');
    return function (arr, size) {
      if (!arr) {
        return;
      }

      var newArr = [];
      for (var i = 0; i < arr.length; i += size) {
        newArr.push(arr.slice(i, i + size));
      }

      var cachedParts;
      var arrString = JSON.stringify(arr);
      cachedParts = arrayCache.get(arrString + size);
      if (JSON.stringify(cachedParts) === JSON.stringify(newArr)) {
        return cachedParts;
      }

      arrayCache.put(arrString + size, newArr);
      return newArr;
    };
  }]);