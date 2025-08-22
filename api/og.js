import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).send("No URL given");
    }

    const r = await fetch(targetUrl);
    const html = await r.text();
    const dom = new JSDOM(html);
    const meta = (prop) =>
      dom.window.document.querySelector(`meta[property='${prop}']`)?.content ||
      dom.window.document.querySelector(`meta[name='${prop}']`)?.content;

    const title = meta("og:title") || dom.window.document.title;
    const desc = meta("og:description") || "";
    const img = meta("og:image") || "";
    const url = meta("og:url") || targetUrl;

    // отдаем страницу с OG
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <title>${title}</title>
</head>
<body>
  <p>OG Proxy for <a href="${url}">${url}</a></p>
  <img src="${img}" alt="">
</body>
</html>`);
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
}
