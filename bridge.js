const http = require('http');
const https = require('https');

// Configuration
const PORT = process.env.PORT || 8081;
const RELAY_HOST = process.env.RELAY_HOST || 'relay.cafebuzz.ir';
const TARGET_API = process.env.TARGET_API || 'https://api.telegram.org';

const server = http.createServer((req, res) => {
    const relayPath = req.url;
    const options = {
        hostname: RELAY_HOST,
        port: 443,
        path: relayPath,
        method: req.method,
        headers: {
            ...req.headers,
            'host': RELAY_HOST,
            'x-relay-target': TARGET_API,
            'x-relay-path': relayPath,
            'user-agent': 'curl/7.88.1'
        }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error('[Bridge Error]:', err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
    });

    req.pipe(proxyReq, { end: true });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[Bridge Started] Listening on http://127.0.0.1:${PORT}`);
    console.log(`[Target] Forwarding to ${TARGET_API} via ${RELAY_HOST}`);
});
