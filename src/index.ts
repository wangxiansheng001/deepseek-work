/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const VITE_DEEPSEEK_API_BASE_URL = "https://api.deepseek.com/v1"
export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 })
		}

		if (url.pathname === '/api') {
			// 获取原始请求的克隆副本以读取 body
			// 解析 JSON 请求体
			const requestBody = await request.json();
			// 构建发送到 DeepSeek API 的请求
			const deepseekRequest = new Request(`${VITE_DEEPSEEK_API_BASE_URL}/chat/completions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${env.VITE_DEEPSEEK_API_KEY}`, // 使用 Secret 中的 API Key
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age': '86400'
				},
				body: JSON.stringify(requestBody)
			});
			try {
				const response = await fetch(deepseekRequest);
				// 将 DeepSeek API 的响应返回给客户端
				return response;
			} catch (error) {
				console.error('Error calling DeepSeek API:', error);
				return new Response('Internal Server Error', { status: 500 });
			}
		}

		return new Response('Internal Server Error', { status: 500 });

	},
} satisfies ExportedHandler<Env>;
