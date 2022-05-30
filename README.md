# <center>S3 Uplod Library</center>
---

## Install
---

<strong>To use the package, just do the standard</strong>

    $ npm install --save s3-upload-helper


## Startup
---

* <strong>CommonJS</strong>

```js

var S3Helper = require('s3-upload-helper');

var s3 = new S3Helper('accessId', 'secretKey', 's3BucketName', 's3Region');

```
* ESM

```js

import S3Helper  from 's3-upload-helper';

const s3 = new S3Helper('accessId', 'secretKey', 's3BucketName', 's3Region');

```

## Usage
---

* <strong>uploadFileS3</strong>

```js
// use it as a middleware 

// pass fileName inside req body for naming your file 

// if not passed, file name would be File/File-current_time.extension

// file will be available on req.files as array of fles

router.post('/upload-file', s3.uploadFileS3, (req, res) => {
	const file = req.files; // Array of files
	if (file) {
		return res.status(200).send({ data: file });
	}
	res.status(500).send({ errMsg: 'Something went wrong, file not uploaded' });
});

```

* <strong>S3ExtractMeta</strong>

```js

router.post('/extract-file-metadata', (req, res) => {
	// pass file as array of objects
	const file = req.files;
	const metaData = s3.S3ExtractMeta(file);
	if (metaData) {
		return res.status(200).send({ data: metaData });
	}

	res.status(500).send({
		errMsg: 'Something went wrong',
	});
});

```