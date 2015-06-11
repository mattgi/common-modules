angular.module('app.modules.common.services').factory('$data', [
  '$rootScope',
  '$log',
  '$http',
  '$notification',
  '$applicationLoggingService',
  '$socket',
  '$config',
  function($rootScope, $log, $http, $notification, $applicationLoggingService, $socket, $config) {
    var svc = {
      models: {
        'blacklisted-emails': {
          name: 'blacklistedEmail',
          plural: 'blacklistedEmails',
          url: '/blacklisted-emails',
          initialized: false
        },
        'media': {
          name: 'media',
          plural: 'media',
          url: '/media',
          initialized: false
        },
        'users': {
          name: 'user',
          plural: 'users',
          url: '/users',
          initialized: false
        },
        'roles': {
          name: 'role',
          plural: 'roles',
          url: '/roles',
          initialized: false
        },
        'migrations': {
          name: 'migration',
          plural: 'migrations',
          url: '/migrations',
          initialized: false
        },
        'settings': {
          name: 'settings',
          plural: 'settings',
          url: '/settings',
          initialized: false
        }
      },

      active: {
      },

      data: {
      },

      deactivate: function(modelName) {
        var meta = svc.models[modelName];
        delete svc.active[meta.name];
      },

      activate: function(modelName, id, next, forceRefresh) {
        id = svc.safeNumberOrString(id);

        var meta = svc.models[modelName];
        var data = svc.data[meta.plural];

        if (!forceRefresh) {
          svc.active[meta.name] = _.findWhere(svc.data[meta.plural], { id: id });
          if (next) {
            next();
          }
        } else {
          svc.init(modelName, function(err, data) {
            svc.active[meta.name] = _.findWhere(svc.data[meta.plural], { id: id });
            if (angular.isUndefined(svc.active[meta.name])) {
              if (next) {
                return next([meta.name, id, ' could not be found.'].join(' '), data);
              }
            }

            if (next) {
              next();
            }
          });
        }
      },

      // options: { filter: { report: '123' }, query: { report: '123'} }
      // query will append to querystring
      // filter occurs after fetch
      init: function(modelName, options, next) {
        var meta = svc.models[modelName];
        options = options || {};
        svc.data[meta.plural] = [];
        delete svc.active[meta.name];

        if (!next && _.isFunction(options)) {
          next = options;
          options = {};
        }

        svc.list(modelName, options, function(err, pagination) {
          meta.initialized = true;
          if (next) {
            next(err, pagination);
          }
        });
      },

      list: function(modelName, options, next) {
        options = options || {};
        var meta = svc.models[modelName];
        var url = meta.url;
        var request = { method: 'list', modelName: modelName };
        var q;

        if (!next && _.isFunction(options)) {
          next = options;
          options = {};
        }

        if (options.pagination) {
          q = $.param(options.pagination);
        }

        if (options.sort) {
          var sort = $.param({ sort: options.sort });
          q = q ? [ q, sort ].join('&') : sort;
        }

        if (options.filters) {
          var filters = $.param(options.filters);
          q = q ? [ q, filters ].join('&') : filters;
        }

        if (q) url = [ url, q ].join('?');

        $http({ method: 'GET', url: $config.uri.api + url })
          .success(function(data, status) {
            var pagination = {
              hasMore: data && data['has_more'] ? data['has_more'] : false,
              itemCount: data && data.itemCount ? data.itemCount : 0
            };

            if (data && data.data) {
              data = data.data;
            }

            if (data && angular.isObject(data) && !angular.isArray(data)) {
              data = [ data ];
            }

            if (angular.isArray(data)) {

              if (options.filter) {
                data = _.filter(data, function(item) {
                  var isMatch = true;
                  _.forIn(options.filter, function(value, key) {
                    if (_.isUndefined(item[key])) {
                      isMatch = true;
                    } else {
                      isMatch = item[key] === value;
                    }
                  });
                  return isMatch;
                });
              }

              _.each(data, function(item) {
                svc.inject(modelName, item);
              });
              pagination.models = data;
              svc.handleResponse(null, pagination, request, next);
            } else {
              svc.handleResponse(status, data, request, next);
            }
          })
          .error(function(data, status) {
            svc.handleResponse(status, data, request, next);
          });
      },

      fetch: function(modelName, id, next) {
        id = svc.safeNumberOrString(id);
        var request = { method: 'fetch', modelName: modelName, id: id };

        var url = svc.models[modelName].url;
        var query = '/' + encodeURIComponent(id);

        $http({ method: 'GET', url: $config.uri.api + url + query })
          .success(function(data, status) {

            if (data && data.itemCount === 0) {
              return svc.handleResponse(404, data.data || null, request, next);
            }

            if (data && data.data) {
              data = data.data;
            }

            if (_.isArray(data)) {
              data = (data.length > 0 ? data[0] : null);
            }

            if (svc.inject(modelName, data)) {
              return svc.handleResponse(null, data, request, next);
            } else {
              return svc.handleResponse(status, data, request, next);
            }
          })
          .error(function(data, status) {
            return svc.handleResponse(status, data, request, next);
          });
      },

      inject: function(modelName, modelInstance) {
        if (!modelInstance) return null;

        var id = svc.safeNumberOrString(modelInstance.id);
        var meta = svc.models[modelName];
        var existing = _.findWhere(svc.data[meta.plural], {id: id });
        if (existing) {
          _.merge(existing, modelInstance);
        } else {
          if (_.isUndefined(svc.data[meta.plural])) {
            svc.data[meta.plural] = [ modelInstance ];
          } else {
            svc.data[meta.plural].push(modelInstance);
          }
        }

        return modelInstance;
      },

      create: function(modelName, model, next) {
        var meta = svc.models[modelName];
        var url = meta.url;
        var request = { method: 'create', modelName: modelName, model: model };

        $http({ method: 'POST', url: $config.uri.api + url, data: model })
          .success(function(data, status) {
            if (svc.inject(modelName, data)) {
              svc.activate(meta.plural, data.id);
              svc.handleResponse(null, data, request, next);
            } else {
              svc.handleResponse(status, data, request, next);
            }
          })
          .error(function(data, status) {
            svc.handleResponse(status, data, request, next);
          });
      },

      save: function(modelName, model, next) {
        var meta = svc.models[modelName];
        var url = meta.url + '/' + model.id;
        var request = { method: 'save', modelName: modelName, model: model };

        $http({ method: 'PUT', url: $config.uri.api + url, data: model })
          .success(function(data) {
            svc.inject(modelName, data);
            svc.handleResponse(null, data, request, next);
          })
          .error(function(data, status) {
            svc.handleResponse(status, data, request, next);
          });
      },

      destroy: function(modelName, id, next) {
        id = svc.safeNumberOrString(id);
        var request = { method: 'destroy', modelName: modelName, id: id };

        var meta = svc.models[modelName];
        var url = meta.url;

        // Lets get cocky and delete it client side before the server responses.
        var item = _.findWhere(svc.data[meta.plural], { id: id });
        var index = _.indexOf(svc.data[meta.plural], item);
        if (index > -1) {
          svc.data[meta.plural].splice(index, 1);
        }
        if (svc.active[meta.name] && svc.active[meta.name].id === id) {
          svc.deactivate(meta.plural);
        }

        // The formality of actually deleting the model. :P
        $http({ method: 'DELETE', url: $config.uri.api + url + '/' + encodeURIComponent(id) })
          .success(function() {
            svc.handleResponse(null, null, request, next);
          })
          .error(function(data, status) {
            svc.handleResponse(status, data, request, next);
          });
      },

      purge: function(modelName, id) {
        id = svc.safeNumberOrString(id);
        var meta = svc.models[modelName];
        var data = svc.data[meta.plural];

        if (_.isArray(data) && data.length > 0) {
          svc.data[meta.plural] = _.reject(svc.data[meta.plural], { id: id });
        }
      },

      handleResponse: function (error, data, request, next) {

        if (error && error > 404) {
          $notification.error('Error', 'An error has occured on the server. Please refresh this page and try again.');
          request = request || {};
          $applicationLoggingService.error('data-service error: ' + error + ' - ' + data + '\nRequest:     ' + JSON.stringify(request, null, 2));
        }

        if (error && next) {
          return next(error, data);
        }

        if (next) {
          return next(null, data);
        }
      },

      safeNumberOrString: function(value) {
        // bitwise not will return a 0 if any chars detected
        return (~~value > 0) ? ~~value : value;
      },

      isSubscribed: false,

      subscribe: function() {
        $socket.emit('subscribe', {}, function(err) {
          if (err) {
            console.error('error', err);
          } else {
            svc.isSubscribed = true;
          }
        });
      },

      unsubscribe: function() {
        if (svc.isSubscribed) {
          $socket.emit('unsubscribe', {}, function(err) {
            if (err) {
              console.error('error', err);
            } else {
              svc.isSubscribed = false;
            }
          });
        }
      }

    };

    $socket.on('publish', function(message) {
      if (message.verb === 'add') {
        console.log('add ' + message.id);
        svc.inject(message.modelName, message.model);
      } else if (message.verb === 'update') {
        console.log('update ' + message.id);
        svc.inject(message.modelName, message.model);
      } else if (message.verb === 'remove') {
        console.log('remove ' + message.id);
        svc.purge(message.modelName, message.id);
      }
    });

    return svc;
  }
]);
