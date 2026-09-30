export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const target = request.headers.get("x-relay-target") || "https://api.telegram.org";
    const targetUrl = new URL(target);

    // Build outbound target URL
    const outboundUrl = new URL(url.pathname + url.search, targetUrl.origin);

    const headers = new Headers(request.headers);
    headers.set("Host", targetUrl.hostname);

    const proxyRequest = new Request(outboundUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: "follow"
    });

    return fetch(proxyRequest);
  }
};
