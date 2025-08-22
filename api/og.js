import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).send("No URL provided. Use ?url=<URL>");
    }

    // fetch с User-Agent, как у браузера
    const r = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0 Safari/537.36",
      },
    });
    if (!r.ok) {
      return res.status(500).send("Failed to fetch target URL");
    }

    const html = await r.text();

    let title = "", desc = "", img = "";
    try {
      const dom = new JSDOM(html);
      const meta = (prop) =>
        dom.window.document.querySelector(`meta[property='${prop}']`)?.content ||
        dom.window.document.querySelector(`meta[name='${prop}']`)?.content ||
        "";

      title = meta("og:title") || dom.window.document.title || "No title";
      desc = meta("og:description") || "";
      img = meta("og:image") || "";
    } catch (e) {
      console.error("Error parsing HTML:", e);
    }

    const url = targetUrl;

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
    console.error("Internal error:", e);
    res.status(500).send("Internal Server Error: " + e.message);
  }
}
