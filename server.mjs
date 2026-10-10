import { createServer } from 'node:http';

const origin = process.env.APP_ORIGIN ? new URL(process.env.APP_ORIGIN) : null;
if (origin && (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password)) {
	throw new Error('APP_ORIGIN must be an HTTP(S) origin without a path or credentials');
}

// Kit 3 removed runtime ORIGIN. Supply canonical headers before its Node handler constructs requests.
process.env.PROTOCOL_HEADER = 'x-forwarded-proto';
process.env.HOST_HEADER = 'x-forwarded-host';
process.env.PORT_HEADER = '';
/** @type {{ handler: import('node:http').RequestListener }} */
const { handler } = await import(new URL('./build/handler.js', import.meta.url).href);

const server = createServer((request, response) => {
	request.headers['x-forwarded-proto'] = origin?.protocol.slice(0, -1) ?? 'http';
	request.headers['x-forwarded-host'] = origin?.host ?? request.headers.host;
	handler(request, response);
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, process.env.HOST ?? '0.0.0.0', () => {
	console.log(`Listening on port ${port}`);
});
for (const signal of ['SIGTERM', 'SIGINT']) {
	process.on(signal, () => {
		server.close(() => process.exit(0));
		setTimeout(() => process.exit(1), 30_000).unref();
	});
}
