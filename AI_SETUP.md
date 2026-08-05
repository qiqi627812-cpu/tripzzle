# Tripzzle 大模型接入说明

## 已实现的流程

1. 用户在“告诉 AI 你的特殊要求”中输入自然语言偏好。
2. 前端把目的地、天数、交通方式和已选地点发送到 `/api/ai-plan`。
3. 服务端调用 OpenAI Responses API，并要求模型返回严格的 JSON 结构。
4. AI 作为主规划器，决定每一天的地点组合、访问顺序、午餐、晚餐和主题。
5. 原有确定性程序负责补充交通、填补缺失餐食、执行远郊硬约束和最终校验。
6. AI 超时、未配置或调用失败时，自动使用原有算法生成行程。

真实 API Key 只允许配置在服务端环境变量中，不能使用 `VITE_` 前缀，也不能提交到 GitHub。

## 本地配置

使用豆包时，在 `.env.local` 中填写：

```dotenv
AI_PROVIDER=doubao
ARK_API_KEY=你的火山方舟_API_Key
ARK_MODEL=doubao-seed-2-0-lite-260428
```

`ARK_MODEL` 也可以填写火山方舟控制台中的推理接入点 ID（`ep-...`）。

如需切回 OpenAI：

```dotenv
AI_PROVIDER=openai
OPENAI_API_KEY=你的_OpenAI_API_Key
OPENAI_MODEL=gpt-5.6-luna
```

> 只运行 Vite 前端开发服务器时，`/api` Serverless Function 不会自动运行。建议使用 Vercel CLI 进行完整本地联调，或直接创建一个 Preview 部署。

## Vercel 部署

当前线上 GitHub Pages 无法运行 `/api/ai-plan`，因此 AI 版本应部署到 Vercel：

1. 在 Vercel 导入 Tripzzle GitHub 仓库。
2. Framework Preset 选择 Vite。
3. Build Command 使用 `npm run build`。
4. Output Directory 使用 `dist`。
5. 在 Project Settings → Environment Variables 中添加：
   - `OPENAI_API_KEY`：标记为 Secret。
   - `OPENAI_MODEL`：`gpt-5.6-luna`。
   - 原有的 `BAIDU_API_KEY` 和 `BAIDU_SECRET_KEY`。
6. 创建 Preview 部署并完成下方验收，再切换正式域名。

## 上线前验收

- 选择至少三个地点，输入“带老人，少走路，不要早起”，能够生成行程。
- 结果中的 `ai.applied` 为 `true`。
- 浏览器网络请求中只能看到 `/api/ai-plan`，不能看到 OpenAI API Key。
- 临时移除 `OPENAI_API_KEY` 后，仍能用原算法生成行程。
- 长城、迪士尼、武隆等远郊或全天地点仍遵守原有排程规则。
- 同一输入连续测试多次，不出现虚构地点。
- Vercel 日志不记录用户完整偏好、精确位置或 API Key。

## 当前边界

- AI 不查询实时营业时间、门票、天气或交通数据。
- AI 只能使用用户已选择的地点 ID，不能凭空增加地点。
- AI 负责逐日规划；确定性程序保留最终安全校验和失败兜底。
- 后续若开放给公众使用，应增加用户级限流、调用预算和匿名化的 `safety_identifier`。
