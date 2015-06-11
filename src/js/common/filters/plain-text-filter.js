angular.module('app.modules.common.filters')
  .filter('plainTextFilter', [function() {
    return function (text) {
      return String(text).replace(/<br[\/]*\>/gm, ' ')
                         .replace(/<[^>]+>/gm, '')
                         .replace(/&nbsp;/gm, ' ');
    };
  }]);