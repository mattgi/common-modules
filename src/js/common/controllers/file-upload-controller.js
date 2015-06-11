// angular.module('app.modules.common.controllers').controller('FileUploadController', [
//   '$rootScope',
//   '$scope',
//   '$state',
//   '$account',
//   '$auth',
//   '$data',
//   '$notification',
//   '$upload',
//   '$timeout',
//   function ($rootScope, $scope, $state, $account, $auth, $data, $notification, $upload, $timeout) {
//     $scope.data = $data.data;
//     $scope.active = $data.active;

//     $scope.isArray = angular.isArray;

//     $scope.fileProgress = 0;
//     $scope.uploadInProgress = false;
//     $scope.uploadSuccessful = false;
//     $scope.uploadErrored = false;
//     $scope.currentUploads = 0;

//     $scope.files;

//     $scope.$watch('files', function () {
//       $scope.upload($scope.files);
//     });

//     var onLocationChangeOff = $rootScope.$on("$stateChangeStart", function (event, next, current) {
//       if ($scope.currentUploads > 0) {
//         if (!confirm("There are file uploads currently in progress, leaving the page will cancel them. Leave page?")) {
//           event.preventDefault();
//         } else {
//           onLocationChangeOff();
//         }
//       }
//     });

//     var onUnloadCallback = function (event) {
//       if ($scope.currentUploads === 0 ) return;
//       var message = "There are file uploads currently in progress, leaving the page will cancel them.";
//       if (typeof event == 'undefined') {
//         event = window.event;
//       }
//       if (event) {
//         event.returnValue = message;
//       }
//       return message;
//     }

//     $scope.upload = function (files) {
//       if (!files) return;

//       var acceptedMediaExtensions = [ 'tif','tiff','png','jpg','jpeg','bmp','eps','psd','svg', 'svgz', 'ai','doc','docx','xls','xlsx','ppt','pptx','vsd','vdx', 'pdf' ];
//       var acceptedPackExtensions  = ['zip', 'rar', 'zipx', 'tar.gz', 'gz', '7z', 'tar', 'tgz'];
//       var updateProgress = function(e) {
//         var progressPercentage = parseInt(60 * (e.loaded / e.total));
//         var media = _.findWhere($data.data.media, { id: e.config.model.id });
//         if (media) {
//           media.progress = progressPercentage + 10 ;
//         }
//       };

//       var success = function(data, status, headers, config) {
//         console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
//       };

//       var containsValidMedia = function (files) {
//         var entryFound = false;
//         files.forEach(function(filename) {
//           if (acceptedMediaExtensions.indexOf(filename.split('.').pop().toLowerCase()) !== -1) {
//             entryFound = true;
//           }
//         });
//         return entryFound;
//       };

//       var containsValidSizes = function (data) {
//         if (!data) return false;
//         data.forEach(function (size) {
//           if (!size) {
//             return;
//           }
//           if (typeof size === 'object') { //zip entry
//             if (!isValidSize({size: size.uncompressedSize})) return false;
//           } else {
//             if (!isValidSize({size: size})) return false;
//           }
//         });
//         return true;
//       };

//       var isValidSize = function (file) {
//         var mb = (file.size / 1000000.0);
//         return mb < 25; //25 MB tops
//       };

//       var inspectRar = function (file, cb) {
//         new RarArchive(file, function(err) {
//             var self = this;
//             if (err) {
//               err = new Error('Unsupported RAR File');
//               err.passthrough = true;
//               cb(err);
//               return;
//             }
//             if (containsValidMedia(_.pluck(this.entries, 'name'))) {
//               if (containsValidSizes(_.pluck(this.entries, 'size'))) {
//                 cb();
//               } else {
//                 var error = new Error('Invalid content size');
//                 error.code = 5002;
//                 return  cb(error);
//               }
//             } else {
//               cb(new Error('No supported filetype found'));
//             }
//           });
//       };

//       var inspectZip = function (file, cb) {
//         var reader = new FileReader();
//         reader.onload = (function (theFile) {
//           return function (e) {
//             try {
//               var zip = new JSZip(e.target.result);
//               if (containsValidMedia(_.pluck(zip.files, 'name'))) {
//                 if (containsValidSizes(_.pluck(zip.files, '_data'))) {
//                   return cb();
//                 } else {
//                   var error = new Error('Invalid content size');
//                   error.code = 5002;
//                   return  cb(error);
//                 }
//               } else {
//                 cb(new Error('No supported filetype found'));
//               }
//             } catch (err) {
//               var error = new Error('Unsupported ZIP file');
//               error.passthrough = true;
//               cb(error);
//             }
//           };
//         })(file);
//         reader.readAsArrayBuffer(file);
//       };

//       var inspectTar = function (file, cb) {
//         var reader = new FileReader();
//         reader.onloadend = (function (theFile) {
//           return function (e) {
//             try {
//               var fileAsBytes = ByteHelper.stringUTF8ToBytes(e.target.result);
//               var tarFile = TarFile.fromBytes(file.name, fileAsBytes);
//               if (containsValidMedia(_.pluck(_.pluck(tarFile.entries, 'header'), 'fileName'))) {
//                 if (containsValidSizes(_.pluck(_.pluck(tarFile.entries, 'header'), 'fileSizeInBytes'))) {
//                   return cb();
//                 } else {
//                   var error = new Error('Invalid content size');
//                   error.code = 5002;
//                   return  cb(error);
//                 }
//               } else {
//                 cb(new Error('No supported filetype found'));
//               }
//             } catch (e) {
//               var error = new Error('Unsupported TAR file');
//               error.passthrough = true;
//               cb(error);
//             }
//           };
//         })(file);
//         reader.readAsBinaryString(file);
//       };

//       var inspectFile = function (file, cb) {
//         if (!isValidSize(file)) {
//           var err = new Error('File too large.');
//           err.code = 1000;
//           return cb(err);
//         }
//         if (file.name.match(/(zip)$/i)) {
//           inspectZip(file, cb);
//         } else if (file.name.match(/(rar)$/i)) {
//           inspectRar(file, cb);
//         } else if (file.name.match(/(tar)$/i)) {
//           inspectTar(file, cb);
//         } else if (acceptedMediaExtensions.concat(acceptedPackExtensions).indexOf(file.name.split('.').pop().toLowerCase()) !== -1) {
//           cb(); //Acceptable but not analizable by client file, let it slide.
//         } else {
//           cb(new Error('Filetype not supported'));
//         }
//       };

//       var removeListener = function (name, handler) {
//         if (window.removeEventListener) {
//           window.removeEventListener(name, handler);
//         } else if (window.detachEvent) {
//           window.detachEvent(name, handler);
//         } else {
//           console.log('Can\'t remove event: ' + name);
//         }
//       }

//       files = [].concat(files); //Force an array (older browsers send a single file)
//       if (!files || files.length === 0) {
//         console.log('No files selected');
//         return;
//       }

//       $scope.currentUploads += files.length;

//       window.onbeforeunload = onUnloadCallback;


//       async.each(files, function (file, cb) {
//         var fileSize = (file.size / 1000000.0) || 0;
//         var model = {
//           filename: file.name,
//           extension: file.name.split('.').pop(),
//           size: +(Math.round(fileSize + 'e+2') + 'e-2'),
//           report: $scope.active.report.id,
//           state: 'uploading',
//           user: $account.me.id
//         };
//         $data.create('media', model, function (err, data) {
//           //Create empty model for file
//           inspectFile(file, function (err) {
//             if (err && !err.passthrough) {
//               //Update model with error
//               if (!data.validations) {
//                 data.validations = [ err.code || 5001];
//               } else {
//                 data.validations.push(err.code || 5001);
//               }
//               data.error = err;
//               data.state = 'completed';
//               $scope.currentUploads --;
//               if ($scope.currentUploads <= 0) removeListener('onbeforeunload', onUnloadCallback);
//               $data.save('media', data, function (err, data) {
//                 cb(err);
//               });
//             } else {
//               //Jump to 9% after inspection
//               data.progress = 9;
//               $data.save('media', data, function (err, data) {
//                 var model = {
//                   url: '/v1/uploads',
//                   fields: { 'user': $account.me.id, 'media': data.id },
//                   model: data,
//                   file: file,
//                   withCredentials: true,
//                   transformRequest: angular.identity
//                 };

//                 $upload.upload(model).progress(updateProgress).success(function (data, status, headers, config) {
//                   console.log('file uploaded');
//                   $scope.currentUploads --;
//                   if ($scope.currentUploads <= 0) removeListener('onbeforeunload', onUnloadCallback);
//                   cb();
//                 });
//               });
//             }
//           });
//         });
//       }, function (err) {
//         //Done
//       });
//     };
//   }
// ]);
