import { formatJSONResponse } from '@libs/apiGateway';
import { BUCKET_NAME } from '@libs/constants';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';

const s3 = new S3({
  endpoint: 'http://localhost:4566',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

export const generateSignedUploadUrl: APIGatewayProxyHandler = async (event) => {
  console.log(event.body);
  const { fileName, fileType } = JSON.parse(event.body) as { fileName: string; fileType: string };
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Expires: 60 * 5,
    ContentType: fileType,
    ACL: 'public-read'
  };

  const signedUrl = await s3.getSignedUrlPromise('putObject', params);

  return formatJSONResponse({ signedUrl });
};
