import { handlerPath } from '@libs/handlerResolver';
import type { AWS } from '@serverless/typescript';

export const generateSignedUploadUrl: AWS['functions'][0] = {
  handler: `${handlerPath(__dirname)}/handler.generateSignedUploadUrl`,
  events: [
    {
      http: {
        method: 'post',
        path: 'pre-signed-urls',
      },
    },
  ],
};

export const generateImageThumbnail: AWS['functions'][0] = {
  handler: `${handlerPath(__dirname)}/handler.generateImageThumbnail`,
  events: [
    {
      s3: {
        bucket: 'photos',
        event: 's3:ObjectCreated:*',
      }
    },
  ],
};
