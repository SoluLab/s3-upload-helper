'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _multerS = require('multer-s3');

var _multerS2 = _interopRequireDefault(_multerS);

var _sharp = require('sharp');

var _sharp2 = _interopRequireDefault(_sharp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var S3Helper = function () {
	function S3Helper(accessId, secretKey, s3BucketName, s3Region) {
		_classCallCheck(this, S3Helper);

		this.s3 = null;
		this.uploadFileS3 = null;
		this.S3ExtractMeta = null;
		this.accessId = accessId;
		this.secretKey = secretKey;
		this.bucketName = s3BucketName;
		this.s3Region = s3Region;
		this.init();
	}

	_createClass(S3Helper, [{
		key: 'init',
		value: function init() {
			// S3 Configurarion
			this.s3 = new _awsSdk2.default.S3({
				credentials: {
					accessKeyId: this.accessId,
					secretAccessKey: this.secretKey
				},
				region: this.s3Region
			});

			// Multer function for upload
			this.uploadFileS3 = (0, _multer2.default)({
				// Multer-S3 function for storege
				storage: (0, _multerS2.default)({
					s3: this.s3,
					acl: 'public-read',
					bucket: this.bucketName,
					// Metadata for putting field name
					metadata: function metadata(req, file, cb) {
						cb(null, { fieldName: file.fieldname });
					},

					// Set or Modify original filename
					key: function key(req, file, cb) {
						var fileName = req.body.fileName ? req.body.fileName : 'File';
						var fullPath = fileName + '/' + fileName + '-' + Date.now() + _path2.default.extname(file.originalname);
						cb(null, fullPath);
					},
					shouldTransform: function shouldTransform(req, file, cb) {
						cb(null, /^image/i.test(file.mimetype));
					},
					transforms: [{
						id: 'toWebp',
						key: function key(req, file, cb) {
							var fileName = req.body.fileName ? req.body.fileName : 'File';
							var fullPath = fileName + '/' + fileName + '}-' + Date.now() + '.webp';
							cb(null, fullPath);
						},
						transform: function transform(req, file, cb) {
							cb(null, (0, _sharp2.default)().webp());
						}
					}]
				})
			}).array('file');

			// Extract meta data of file
			this.S3ExtractMeta = function (files) {
				// Fetch uploaded file information
				var FILE = [];
				for (var fileIndex = 0; fileIndex < files.length; fileIndex++) {
					var file = files[fileIndex];
					var metaSource = file.transforms ? file.transforms[0] : file;
					if (metaSource) {
						metaSource.mimetype = metaSource.mimetype ? metaSource.mimetype : 'image/webp';
						var contentType = /^image/i.test(file.mimetype) ? 'image' : /^video/i.test(file.mimetype) ? 'video' : null;
						FILE.push({
							mimetype: metaSource.mimetype,
							contentType: contentType,
							key: metaSource.key,
							location: metaSource.location,
							size: metaSource.size
						});
					}
				}
				return FILE;
			};
		}
	}]);

	return S3Helper;
}();

module.exports = S3Helper;