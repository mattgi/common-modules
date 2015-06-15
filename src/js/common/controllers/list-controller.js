angular.module('app.modules.common.controllers').controller('ListController', [
  '$rootScope',
  '$scope',
  '$state',
  '$notification',
  '$pop',
  '$data',
  '$config',
  function ($rootScope, $scope, $state, $notification, $pop, $data, $config) {

    $scope.data = $data.data;
    $scope.editable = {};

    $scope.list = {
      model: '',
      columns: [],
      total: -1,
      pagination: {
        currentPage: 1,
        limit: 25,
      },
      display: {
        filters: false,
        columns: false,
        actions: true,
        create: false,
        show: false,
        edit: true,
        destroy: true
      }
    };

    $scope.toggleFilters = function() {
      $scope.list.display.filters = !$scope.list.display.filters;
    };

    $scope.toggleColumns = function() {
      var tmpl = '/templates/table/column-chooser.html';
      $pop.dialog($scope.meta.route, null, null,  tmpl, $scope);
    };

    $scope.pagedDetails = function() {
      var from = (($scope.list.pagination.currentPage - 1) * $scope.list.pagination.limit) + 1;
      var to = $scope.list.pagination.currentPage * $scope.list.pagination.limit;
      if ($scope.list.total < to) to = $scope.list.total;
      return [ from, 'to', to, 'of', $scope.list.total, $scope.list.model ].join(' ');
    };

    $scope.request = {
      pagination: {
        page: 1,
        limit: $scope.list.pagination.limit
      }
    };

    $scope.prevPage = function() {
      $scope.list.pagination.currentPage = $scope.list.pagination.currentPage - 1;
      $scope.getPage();
    };

    $scope.nextPage = function() {
      $scope.list.pagination.currentPage = $scope.list.pagination.currentPage + 1;
      $scope.getPage();
    };

    $scope.sortColumn = function(col) {
      if (col.sortDirection === 'asc') {
        col.sortDirection = 'desc';
      } else {
        col.sortDirection = 'asc';
      }

      var sort = (col.sortDirection === 'asc' ? '' : '-') + col.name;
      _.each($scope.list.columns, function(c) {
        if (c.isSortable && c.name !== col.name) {
          if (_.isString(c.sortDirection) && c.sortDirection.length > 0) {
            sort = sort + ' ' + (c.sortDirection === 'asc' ? '' : '-') + c.name;
          }
        }
      });

      if ($scope.request.sort === sort) return;

      $scope.request.sort = sort;
      $scope.list.pagination.currentPage = 1;
      $scope.getPage();
    };

    $scope.getPage = function() {
      $scope.request.pagination.page = $scope.list.pagination.currentPage;
      $scope.request.pagination.limit = $scope.list.pagination.limit;
      $scope.list.total = -1;
      $data.init($scope.list.model, $scope.request, function(err, data) {
        $scope.list.total = data.itemCount;
        $scope.list.hasMore = data.hasMore;
        if ($scope.list.total > $scope.list.pagination.limit) {
          $scope.list.pagination.pageCount = Math.ceil($scope.list.total / $scope.list.pagination.limit);
        } else {
          $scope.list.pagination.pageCount = 1;
        }
      });
    };

    $scope.getName = function(modelName, id, field) {
      var model = _.findWhere($scope.data[modelName], { id: id });
      if (model) return field ? model[field] : model.name;
      return 'Unknown';
    };

    $scope.format = {
      date: function(field) {
        if (!field) return '';
        return moment(field).format('YYYY-MM-DD hh:mm');
      },
      raw: function(field) {
        if (!field) return '';
        return field;
      },
      title: function(field) {
        if (!field) return '';
        return field.toUpperCase()[0] + field.toLowerCase().substring(1);
      },
      upper: function(field) {
        if (!field) return '';
        return field.toUpperCase();
      },
      count: function(field) {
        if (!field) return '';
        return field.length;
      },
      user: function(field) {
        if (!field) return '';
        return $scope.getName('users', field);
      },
      list: function(field) {
        if (!field) return '';
        return field.join(', ');
      }
    };

    $scope.init = function() {
      $scope.meta = {
        route: $state.current.name
      };

      if ($scope.meta.route !== 'blacklisted-emails') {
        $scope.meta.route = $scope.meta.route.split('-')[0];
      }

      // any defaults based on route.
      $scope.list.model = $scope.meta.route;
      var listConfig = $config.models[$scope.meta.route];
      $scope.list.columns = listConfig.fields;
      $scope.list.display = listConfig.display;

      if ($scope.list.display.realtime) $data.subscribe();


      if ($state.params.filters) {
        _.forOwn($state.params.filters, function(filter, name) {
          var col = _.findWhere($scope.list.columns, { name: name });
          if (col) {
            col.filter = filter;
          }
        });
      }

      $scope.$watch('list.columns', function(newValue, oldValue) {
        var filters = {};
        var sort = {};

        _.each($scope.list.columns, function(col) {
          if (_.isString(col.filter) && col.filter.length > 0) {
            filters[col.name] = col.filter;
          }
        });

        if (_.isEqual($scope.request.filters, filters)) {
          return;
        }

        // if (!_.isEqual($scope.request.sort, sort)) {
        //   request.sort = sort;
        // }

        $scope.list.pagination.currentPage = 1;
        $scope.request.filters = filters;
        $scope.getPage();
      }, true);
    };

    $scope.finalizeColumnSelection = function() {
      $pop.hideAll();
    };

    $scope.createItem = function() {
      if ($scope.list.display.create.isModal) {
        var name = $data.models[$scope.meta.route].singular;
        $scope.editable[name] = {};
        $pop.dialog($scope.meta.route, null, null,  $scope.list.display.create.template, $scope);
      } else {
        $state.go($scope.list.display.create.state);
      }
    };

    $scope.finalizeCreateItem = function() {
      var name = $data.models[$scope.meta.route].singular;
      $data.create($scope.meta.route, $scope.editable[name], function() {
        $pop.hideAll();
        $notification.success(name + ' successfully created.');
        delete $scope.editable[name];
      });
    };

    $scope.editItem = function(item) {
      if ($scope.list.display.edit.isModal) {
        var name = $data.models[$scope.meta.route].singular;
        $scope.editable[name] = angular.copy(item);
        $pop.dialog($scope.meta.route, null, null,  $scope.list.display.edit.template, $scope);
      } else {
        $state.go($scope.list.display.edit.state, { id: item.id });
      }
    };

    $scope.showItem = function(item) {
      $state.go($scope.list.display.show.state, { id: item.id });
    };

    $scope.finalizeEditRow = function() {
      var name = $data.models[$scope.meta.route].singular;
      $data.save($scope.meta.route, $scope.editable[name], function(err) {
        if (err) {
          $notification.error(err);
        } else {
          $pop.hideAll();
          $notification.success(name + ' successfully updated.');
          delete $scope.editable[name];
        }
      });
    };

    $scope.init();
  }
]);
