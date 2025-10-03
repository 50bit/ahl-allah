type Express = any;
type Router = any;

type RouterMount = {
	basePath: string;
	router: Router;
	tags: string[];
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
	components?: {
		securitySchemes?: {
			[key: string]: {
				type: string;
				scheme: string;
				bearerFormat?: string;
			};
		};
	};
	security?: {
		bearerAuth?: {
			type: string;
			scheme: string;
			bearerFormat?: string;
		}[];
	}[];
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
		paths: {},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			}
		},
		security: [
			{
				bearerAuth: []
			}
		]
	};

	for (const { basePath, router, tags } of mounts) {
		const base = sanitizePath(basePath) || '/';
		const eps = getRouterEndpoints(base, router);
		for (const ep of eps) {
			if (!spec.paths[ep.path]) spec.paths[ep.path] = {};
			for (const method of ep.methods) {
				spec.paths[ep.path][method] = {
					summary: `${method.toUpperCase()} ${ep.path}`,
					responses: {
						'200': { description: 'Successful response' }
					},
					tags
				};
			}
		}
	}

	return spec;
}

