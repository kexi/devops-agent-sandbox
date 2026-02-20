#!/bin/bash
set -euo pipefail

STACK_NAME="DevopsAgentSandboxAgentStack"
REGION="us-east-1"
ENDPOINT_URL="https://api.prod.cp.aidevops.us-east-1.api.aws"

echo "=== AWS DevOps Agent Operator App Setup ==="

# 1. DevOps Agent CLI model を追加（未設定の場合）
if ! aws devopsagent help >/dev/null 2>&1; then
  echo "DevOps Agent CLI を設定中..."
  TMPFILE=$(mktemp)
  curl -sfo "$TMPFILE" https://d1co8nkiwcta1g.cloudfront.net/devopsagent.json
  aws configure add-model --service-model "file://${TMPFILE}" --service-name devopsagent
  rm -f "$TMPFILE"
  echo "DevOps Agent CLI の設定完了"
fi

# 2. CloudFormation 出力を取得
echo "CloudFormation 出力を取得中..."

AGENT_SPACE_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs[?OutputKey==`AgentSpaceId`].OutputValue' \
  --output text \
  --region "$REGION")

OPERATOR_ROLE_ARN=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs[?OutputKey==`OperatorRoleArn`].OutputValue' \
  --output text \
  --region "$REGION")

echo "Agent Space ID:    $AGENT_SPACE_ID"
echo "Operator Role ARN: $OPERATOR_ROLE_ARN"

# 3. Operator App を有効化
echo "Operator App を有効化中..."
aws devopsagent enable-operator-app \
  --agent-space-id "$AGENT_SPACE_ID" \
  --auth-flow iam \
  --operator-app-role-arn "$OPERATOR_ROLE_ARN" \
  --endpoint-url "$ENDPOINT_URL" \
  --region "$REGION"

echo "=== セットアップ完了 ==="
echo "Agent Space ID: $AGENT_SPACE_ID"
