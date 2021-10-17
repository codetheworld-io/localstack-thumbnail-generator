import { formatJSONResponse } from '@libs/apiGateway';
import { BUCKET_NAME, ORIGINALS, THUMBNAILS } from '@libs/constants';
import { APIGatewayProxyHandler, S3Handler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import Jimp from 'jimp';
import * as util from 'util';

const s3 = new S3({
  endpoint: 'http://localhost:4566',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

export const generateSignedUploadUrl: APIGatewayProxyHandler = async (event) => {
  const { fileName, fileType } = JSON.parse(event.body) as { fileName: string; fileType: string };
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${ORIGINALS}/${fileName}`,
    Expires: 60 * 5,
    ContentType: fileType,
    ACL: 'public-read',
  };

  const signedUrl = await s3.getSignedUrlPromise('putObject', params);

  return formatJSONResponse({ signedUrl });
};

export const generateImageThumbnail: S3Handler = async (event) => {
  // Read options from the event parameter.
  console.log('Reading options from event:\n', util.inspect(event, { depth: 5 }));

  // Object key may have spaces or unicode non-ASCII characters.
  const fileName = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' ')).split('/').pop();

  // Infer the image type from the file suffix.
  const typeMatch = fileName.match(/\.([^.]*)$/);
  if (!typeMatch) {
    throw new Error('Could not determine the image type.');
  }

  // Check that the image type is supported
  const imageType = typeMatch[1].toLowerCase();
  if (imageType != 'jpg' && imageType != 'png') {
    throw new Error(`Unsupported image type: ${imageType}`);
  }

  // Download the image from the S3 source bucket.
  const originImage = await s3.getObject({
    Bucket: BUCKET_NAME,
    Key: `${ORIGINALS}/${fileName}`
  }).promise();

  // set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
  const width = 200;

  // Use the Jimp module to resize the image and save in a buffer.
  const buffer = await Jimp.create(originImage.Body as Buffer).then((jimp) => {
    return jimp.scale(width / jimp.getWidth()).getBufferAsync(jimp.getMIME());
  });

  // Upload the thumbnail image to the destination bucket
  await s3.putObject({
    Bucket: BUCKET_NAME,
    Key: `${THUMBNAILS}/${fileName}`,
    Body: buffer,
    ContentType: originImage.ContentType,
  }).promise();

  console.log(`Successfully generate thumbnail for ${ORIGINALS}/origins${fileName}`);
  console.log(`Uploaded to ${THUMBNAILS}/${fileName}`);
};
