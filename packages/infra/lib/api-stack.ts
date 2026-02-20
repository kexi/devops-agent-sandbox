import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloFunction = new lambda.NodejsFunction(this, "HelloFunction", {
      entry: path.join(__dirname, "../../app/src/index.ts"),
      handler: "handler",
      runtime: cdk.aws_lambda.Runtime.NODEJS_22_X,
      bundling: {
        format: lambda.OutputFormat.ESM,
        minify: true,
        sourceMap: true,
        mainFields: ["module", "main"],
        banner:
          "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
    });

    const api = new apigateway.LambdaRestApi(this, "HelloApi", {
      handler: helloFunction,
      proxy: false,
    });

    const helloResource = api.root.addResource("hello");
    helloResource.addMethod("GET");

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "API Gateway URL",
    });
  }
}
