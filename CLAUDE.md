# DevOps Agent Sandbox

AWS DevOps Agentの素振り用サンドボックス環境。

## Tech Stack

- **Runtime**: Node.js 22 (mise管理)
- **Package Manager**: pnpm 10 (mise管理)
- **Language**: TypeScript ~5.9 (ESM, strict mode)
- **IaC**: AWS CDK v2 (`aws-cdk-lib`)
- **Test**: Vitest 4
- **Lint**: ESLint 9 (flat config + typescript-eslint)
- **Bundler**: esbuild (NodejsFunction自動バンドリング)

## Project Structure

pnpmワークスペースによるモノレポ構成。

```
packages/
├── app/    # Lambdaハンドラー (@devops-agent-sandbox/app)
└── infra/  # CDKスタック (@devops-agent-sandbox/infra)
```

## Commands

```bash
pnpm test          # Vitest全テスト実行
pnpm test:watch    # Vitestウォッチモード
pnpm typecheck     # TypeScript型チェック (tsc -b)
pnpm lint          # ESLint実行
pnpm lint:fix      # ESLint自動修正
pnpm build         # 全パッケージビルド
pnpm synth         # CDK CloudFormationテンプレート生成
pnpm deploy        # CDKデプロイ
```

個別パッケージ実行: `pnpm --filter @devops-agent-sandbox/app test`

## Coding Conventions

- **ESM統一**: `"type": "module"` + `"module": "Node16"` — importパスに `.js` 拡張子が必要
- **条件の命名**: `const hasName = name !== undefined && name !== "";`
- **早期リターン**: 関数内では早期リターンを心がける

## CDK

- **エントリポイント**: `packages/infra/bin/app.ts`
- **スタック**:
  - `DevopsAgentSandboxApiStack` — API Gateway + Lambda
  - `DevopsAgentSandboxAgentStack` — AWS DevOps Agent (Agent Space + IAMロール + AWS Association)
- **Lambda**: `NodejsFunction` でappパッケージのTSソースを直接バンドリング
- **Runtime**: NODEJS_22_X, ESM出力, `--enable-source-maps`

## DevOps Agent セットアップ

1. CDKデプロイ: `AWS_PROFILE=devops-agent pnpm deploy`
2. Operator App有効化: `./packages/infra/scripts/enable-operator-app.sh`
3. リージョン: us-east-1 のみ（Preview）
