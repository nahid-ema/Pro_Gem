
const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="target" style="background: white; padding: 20px; width: 800px;">
        <h1 style="margin: 0; padding: 0;">Hello</h1>
        <div style="height: 3000px; background: linear-gradient(red, blue);">Tall gradient</div>
        <h2 style="margin: 0; padding: 0;">Bottom</h2>
      </div>
      <script type="module">
        import domToImage from "./node_modules/dom-to-image-more/lib/dom-to-image-more.js";
        window.domToImage = domToImage;
      </script>
    </body>
    </html>
  `);
  await page.waitForTimeout(1000);
  const data = await page.evaluate(async () => {
    const el = document.getElementById("target");
    const canvas = await window.domToImage.toCanvas(el, { height: el.scrollHeight });
    const ctx = canvas.getContext("2d");
    const id = ctx.getImageData(0, canvas.height - 10, 10, 10);
    return { height: canvas.height, data: Array.from(id.data) };
  });
  console.log(data);
  await browser.close();
})();
