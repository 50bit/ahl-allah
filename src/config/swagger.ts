type Express = any;
type Router = any;

type RouterMount = {
	basePath: string;
	router: Router;
};

type OpenApiSpec = {
	openapi: string;
	info: {
		title: string;
		description?: string;
		version: string;
	};
	servers: Array<{ url: string }>;
	paths: Record<string, any>;
};

function sanitizePath(path: unknown): string | null {
	if (typeof path === 'string') {
		return path.startsWith('/') ? path : `/${path}`;
	}
	return null;
}

function getRouterEndpoints(basePath: string, router: Router): Array<{ path: string; methods: string[] }> {
	const endpoints: Array<{ path: string; methods: string[] }> = [];
	const stack: any[] = (router as any).stack || [];
	for (const layer of stack) {
		if (layer && layer.route && layer.route.path) {
			const routePath = sanitizePath(layer.route.path);
			if (!routePath) continue;
			const methods = Object.keys(layer.route.methods || {})
				.filter((m) => (layer.route.methods || {})[m])
				.map((m) => m.toLowerCase());
			endpoints.push({ path: `${basePath}${routePath}`.replace(/\\+/g, '/'), methods });
		} else if (layer && layer.name === 'router' && layer.handle && layer.handle.stack) {
			// Nested routers with a mount path
			let mount = '';
			if (layer.regexp && layer.regexp.fast_slash) {
				mount = '/';
			} else if (layer.regexp) {
				const match = layer.regexp.toString().match(/^\/(\\\/)?\^\\\/(.*?)\\\/?\?\$\//);
				if (match && match[2]) {
					mount = `/${match[2]}`.replace(/\\\//g, '/');
				}
			}
			const child = getRouterEndpoints(`${basePath}${mount}`, layer.handle as Router);
			endpoints.push(...child);
		}
	}
	return endpoints;
}

export function buildOpenApiSpec(app: Express, mounts: RouterMount[], options?: { title?: string; description?: string; version?: string }): OpenApiSpec {
	const spec: OpenApiSpec = {
		openapi: '3.0.3',
		info: {
			title: options?.title || 'API Documentation',
			description: options?.description || 'Auto-generated from Express routes',
			version: options?.version || '1.0.0'
		},
		servers: [{ url: '/' }],
		paths: {}
	};

	for (const { basePath, router } of mounts) {
		const base = sanitizePath(basePath) || '/';
		const eps = getRouterEndpoints(base, router);
		for (const ep of eps) {
			if (!spec.paths[ep.path]) spec.paths[ep.path] = {};
			for (const method of ep.methods) {
				spec.paths[ep.path][method] = {
					summary: `${method.toUpperCase()} ${ep.path}`,
					responses: {
						'200': { description: 'Successful response' }
					}
				};
			}
		}
	}

	// Add health endpoint if present
	if ((app as any)._router && (app as any)._router.stack) {
		try {
			const stack: any[] = (app as any)._router.stack || [];
			for (const layer of stack) {
				if (layer && layer.route && layer.route.path === '/health') {
					if (!spec.paths['/health']) spec.paths['/health'] = {};
					const methods = Object.keys(layer.route.methods || {}).filter((m) => (layer.route.methods || {})[m]);
					for (const method of methods) {
						spec.paths['/health'][method] = {
							summary: `${method.toUpperCase()} /health`,
							responses: { '200': { description: 'OK' } }
						};
					}
				}
			}
		} catch {}
	}

	return spec;
}

export function swaggerHtmlPage(jsonUrl: string, pageTitle = 'API Docs'): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pageTitle}</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.addEventListener('load', function () {
      const ui = SwaggerUIBundle({
        url: '${jsonUrl}',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout'
      });
      window.ui = ui;
    });
  </script>
</body>
</html>`;
}


