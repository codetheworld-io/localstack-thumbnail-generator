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
