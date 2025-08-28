const VITE_DEEPSEEK_API_BASE_URL = "https://api.deepseek.com/v1"

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		// 处理 CORS 预检请求
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 200,
				headers: corsHeaders
			});
		}

		// 方法限制
		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', {
				status: 405,
				headers: corsHeaders
			});
		}

		// 路径验证
		if (!url.pathname.startsWith('/api')) {
			return new Response('Not Found', {
				status: 404,
				headers: corsHeaders
			});
		}

		// 内容类型验证
		if (!request.headers.get('Content-Type')?.includes('application/json')) {
			return new Response('Unsupported Media Type', {
				status: 415,
				headers: corsHeaders
			});
		}

		try {
			// 解析请求体
			const requestBody = await request.json();

			// 构建DeepSeek API请求
			const deepseekRequest = new Request(`${VITE_DEEPSEEK_API_BASE_URL}/chat/completions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${env.VITE_DEEPSEEK_API_KEY}`
				},
				body: JSON.stringify(requestBody)
			});

			// 转发请求
			const response = await fetch(deepseekRequest);
			const modifiedResponse = new Response(response.body, response);

			// 添加CORS头部
			Object.entries(corsHeaders).forEach(([key, value]) => {
				modifiedResponse.headers.set(key, value);
			});

			return modifiedResponse;

		} catch (error) {
			console.error('Error:', error);
			return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
				status: 500,
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json'
				}
			});
		}
	}
} satisfies ExportedHandler<Env>;
