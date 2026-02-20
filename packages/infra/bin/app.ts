#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { ApiStack } from "../lib/api-stack.js";
import { DevopsAgentStack } from "../lib/devops-agent-stack.js";

const app = new cdk.App();

new ApiStack(app, "DevopsAgentSandboxApiStack", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: "us-east-1",
  },
});

new DevopsAgentStack(app, "DevopsAgentSandboxAgentStack", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: "us-east-1",
  },
});
