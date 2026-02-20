import * as cdk from "aws-cdk-lib";
import * as devopsagent from "aws-cdk-lib/aws-devopsagent";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

export class DevopsAgentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Agent Space Role
    const agentSpaceRole = new iam.Role(this, "AgentSpaceRole", {
      roleName: "DevOpsAgentRole-AgentSpace",
      assumedBy: new iam.ServicePrincipal("aidevops.amazonaws.com", {
        conditions: {
          StringEquals: {
            "aws:SourceAccount": this.account,
          },
          ArnLike: {
            "aws:SourceArn": `arn:aws:aidevops:us-east-1:${this.account}:agentspace/*`,
          },
        },
      }),
      description: "Role for AWS DevOps Agent Space",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AIOpsAssistantPolicy"),
      ],
      inlinePolicies: {
        AllowExpandedAIOpsAssistantPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              sid: "AllowAwsSupportActions",
              effect: iam.Effect.ALLOW,
              actions: ["support:CreateCase", "support:DescribeCases"],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              sid: "AllowExpandedAIOpsAssistantPolicy",
              effect: iam.Effect.ALLOW,
              actions: [
                "aidevops:GetKnowledgeItem",
                "aidevops:ListKnowledgeItems",
                "eks:AccessKubernetesApi",
                "synthetics:GetCanaryRuns",
                "route53:GetHealthCheckStatus",
                "resource-explorer-2:Search",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    // 2. Operator App Role
    const operatorRole = new iam.Role(this, "OperatorAppRole", {
      roleName: "DevOpsAgentRole-WebappAdmin",
      assumedBy: new iam.ServicePrincipal("aidevops.amazonaws.com", {
        conditions: {
          StringEquals: {
            "aws:SourceAccount": this.account,
          },
          ArnLike: {
            "aws:SourceArn": `arn:aws:aidevops:us-east-1:${this.account}:agentspace/*`,
          },
        },
      }),
      description: "Role for AWS DevOps Agent Operator App",
      inlinePolicies: {
        AIDevOpsBasicOperatorActionsPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              sid: "AllowBasicOperatorActions",
              effect: iam.Effect.ALLOW,
              actions: [
                "aidevops:GetAgentSpace",
                "aidevops:GetAssociation",
                "aidevops:ListAssociations",
                "aidevops:CreateBacklogTask",
                "aidevops:GetBacklogTask",
                "aidevops:UpdateBacklogTask",
                "aidevops:ListBacklogTasks",
                "aidevops:ListChildExecutions",
                "aidevops:ListJournalRecords",
                "aidevops:DiscoverTopology",
                "aidevops:InvokeAgent",
                "aidevops:ListGoals",
                "aidevops:ListRecommendations",
                "aidevops:ListExecutions",
                "aidevops:GetRecommendation",
                "aidevops:UpdateRecommendation",
                "aidevops:CreateKnowledgeItem",
                "aidevops:ListKnowledgeItems",
                "aidevops:GetKnowledgeItem",
                "aidevops:UpdateKnowledgeItem",
                "aidevops:ListPendingMessages",
                "aidevops:InitiateChatForCase",
                "aidevops:EndChatForCase",
                "aidevops:DescribeSupportLevel",
                "aidevops:SendChatMessage",
              ],
              resources: [
                `arn:aws:aidevops:us-east-1:${this.account}:agentspace/*`,
              ],
            }),
            new iam.PolicyStatement({
              sid: "AllowSupportOperatorActions",
              effect: iam.Effect.ALLOW,
              actions: [
                "support:DescribeCases",
                "support:InitiateChatForCase",
                "support:DescribeSupportLevel",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    // 3. Agent Space
    const agentSpace = new devopsagent.CfnAgentSpace(this, "AgentSpace", {
      name: "DevopsAgentSandbox",
      description: "AgentSpace for DevOps Agent sandbox",
    });

    // 4. AWS Account Association (monitor)
    const awsAssociation = new devopsagent.CfnAssociation(
      this,
      "AWSAssociation",
      {
        agentSpaceId: agentSpace.ref,
        serviceId: "aws",
        configuration: {
          aws: {
            assumableRoleArn: agentSpaceRole.roleArn,
            accountId: this.account,
            accountType: "monitor",
            resources: [],
          },
        },
      },
    );
    awsAssociation.addDependency(agentSpace);

    // Outputs
    new cdk.CfnOutput(this, "AgentSpaceId", {
      value: agentSpace.ref,
      description: "ID of the DevOps Agent Space",
    });

    new cdk.CfnOutput(this, "AgentSpaceRoleArn", {
      value: agentSpaceRole.roleArn,
      description: "ARN of the Agent Space Role",
    });

    new cdk.CfnOutput(this, "OperatorRoleArn", {
      value: operatorRole.roleArn,
      description: "ARN of the Operator App Role",
    });
  }
}
