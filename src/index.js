import path from 'path';
import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import sharp from 'sharp';

class S3Helper {
	constructor(accessId, secretKey, s3BucketName, s3Region) {
		this.s3 = null;
		this.uploadFileS3 = null;
		this.S3ExtractMeta = null;
		this.accessId = accessId;
		this.secretKey = secretKey;
		this.bucketName = s3BucketName;
		this.s3Region = s3Region;
		this.init();
	}

	init() {
		// S3 Configurarion
		this.s3 = new aws.S3({
			credentials: {
				accessKeyId: this.accessId,
				secretAccessKey: this.secretKey,
			},
			region: this.s3Region,
		});

		// Multer function for upload
		this.uploadFileS3 = multer({
			// Multer-S3 function for storege
			storage: multerS3({
				s3: this.s3,
				acl: 'public-read',
				bucket: this.bucketName,
				// Metadata for putting field name
				metadata: (req, file, cb) => {
					cb(null, { fieldName: file.fieldname });
				},

				// Set or Modify original filename
				key: (req, file, cb) => {
					const fileName = req.body.fileName
						? req.body.fileName
						: 'File';
					const fullPath = `${fileName}/${fileName}-${Date.now()}${path.extname(
						file.originalname
					)}`;
					cb(null, fullPath);
				},
				shouldTransform: function (req, file, cb) {
					cb(null, /^image/i.test(file.mimetype));
				},
				transforms: [
					{
						id: 'toWebp',
						key: (req, file, cb) => {
							const fileName = req.body.fileName
								? req.body.fileName
								: 'File';
							const fullPath = `${fileName}/${fileName}}-${Date.now()}.webp`;
							cb(null, fullPath);
						},
						transform: function (req, file, cb) {
							cb(null, sharp().webp());
						},
					},
				],
			}),
		}).array('file');

		// Extract meta data of file
		this.S3ExtractMeta = (files) => {
			// Fetch uploaded file information
			const FILE = [];
			for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
				const file = files[fileIndex];
				const metaSource = file.transforms ? file.transforms[0] : file;
				if (metaSource) {
					metaSource.mimetype = metaSource.mimetype
						? metaSource.mimetype
						: 'image/webp';
					const contentType = /^image/i.test(file.mimetype)
						? 'image'
						: /^video/i.test(file.mimetype)
						? 'video'
						: null;
					FILE.push({
						mimetype: metaSource.mimetype,
						contentType,
						key: metaSource.key,
						location: metaSource.location,
						size: metaSource.size,
					});
				}
			}
			return FILE;
		};
	}
}

module.exports = S3Helper;
