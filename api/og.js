import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url; // Получаем URL из query
    if (!targetUrl) {
      return res.status(400).send("No URL provided. Use ?url=<URL>");
    }

    // Получаем HTML целевой страницы
    const r = await fetch(targetUrl);
    if (!r.ok) {
      return res.status(500).send("Failed to fetch target URL");
    }

    const html = await r.text();
    const dom = new JSDOM(html);

    // Функция для поиска meta-тега
    const meta = (prop) =>
      dom.window.document.querySelector(`meta[property='${prop}']`)?.content ||
      dom.window.document.querySelector(`meta[name='${prop}']`)?.content ||
      "";

    const title = meta("og:title") || dom.window.document.title || "No title";
    const desc = meta("og:description") || "";
    const img = meta("og:image") || "";
    const url = meta("og:url") || targetUrl;

    // Отдаём страницу с OG-метатегами
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
  ${img ? `<img src="${img}" alt="OG image" style="max-width:100%;">` : ""}
</body>
</html>`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error: " + e.message);
  }
}
