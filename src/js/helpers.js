var helpers;
(function (helpers) {

  /**
   * Returns true or false if ionic is available or not
   * @return {bool}
   */
  helpers.isIonic = function isIonic() {
    return 'object' === typeof ionic;
  };

})(helpers || (helpers = {}));