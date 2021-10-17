import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';
import { generateSignedUploadUrl } from '@functions/thumbnail';

const serverlessConfiguration: AWS = {
  service: 'localstack-thumbnail-generator',
  frameworkVersion: '2',
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
    },
    localstack: {
      debug: true,
      stages: ['local'],
    }
  },
  plugins: [
    'serverless-esbuild',
    'serverless-localstack',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'ap-northeast-1',
    versionFunctions: false,
    stage: 'local',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: {
    hello,
    generateSignedUploadUrl,
  },
  resources: {
    Resources: {
      photoBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'photos',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
