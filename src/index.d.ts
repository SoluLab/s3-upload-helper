import aws from 'aws-sdk';
import multer from 'multer';

declare class S3Helper {
	constructor(
		accessId: string,
		secretKey: string,
		s3BucketName: string,
		s3Region: string
	);
	// S3 Configurarion
	s3: aws.S3;

	// Multer function for upload
	uploadFileS3: multer.Multer;

	// Extract meta data of file
	S3ExtractMeta(files: any[]): any[];
}

export default S3Helper;
