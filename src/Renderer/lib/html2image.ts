import * as puppeteer from 'puppeteer';

// -------------------------------------------------------------------------

let pptrOpts: Record<string, any> = {};

export const setPuppeteerLaunchOptions = (opts: Record<string, any>): void => {
  pptrOpts = opts;
};

// -------------------------------------------------------------------------

let browser: puppeteer.Browser | null = null;
let pagePool: puppeteer.Page[] = [];

interface TakeHTMLWrapperOptions {
  html: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  insertToHeader?: string;
}

const takeHTMLWrapper = ({
  html,
  width,
  height,
  backgroundColor,
  insertToHeader,
}: TakeHTMLWrapperOptions) => {
  return `<html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 0;
        width: ${width}px;
        height: ${height}px;
        background-color: ${backgroundColor};
      }
    </style>
    ${insertToHeader}
  </head>
  <body>
    <div id="html-content">
      ${html}
    </div>
  </body>
</html>`;
};

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...pptrOpts,
    });

    for (let i = 0; i < 10; i++) {
      const page = await browser.newPage();
      pagePool.push(page);
    }
  }
  return browser;
}

interface PageWithSource {
  page: puppeteer.Page;
  fromPool: boolean;
}

async function getPage(): Promise<PageWithSource> {
  if (pagePool.length > 0) {
    return {
      page: pagePool.pop()!,
      fromPool: true,
    };
  }

  const browser = await getBrowser();
  return {
    page: await browser.newPage(),
    fromPool: false,
  };
}

interface Html2ImageOptions {
  html: string;
  width?: number;
  height?: number;
  toBase64?: boolean;
  backgroundColor?: string;
  insertToHeader?: string;
}
export async function html2image(options: Html2ImageOptions): Promise<{
  image: string | Buffer;
  width: number;
  height: number;
}> {
  const { page, fromPool } = await getPage();

  try {
    const size: Record<string, number> = {};

    if (options.width) {
      size.width = parseInt(options.width.toString());
    }

    if (options.height) {
      size.height = parseInt(options.height.toString());
    } else {
      size.height = 100;
    }

    // Set viewport size
    await page.setViewport({
      ...(size as any),
      deviceScaleFactor: 2,
    });

    // Set content and wait for network idle
    await page.setContent(
      takeHTMLWrapper({
        html: options.html,
        width: options.width,
        height: options.height,
        backgroundColor: options.backgroundColor,
        insertToHeader: options.insertToHeader,
      }),
      {
        // waitUntil: 'networkidle0',
      },
    );

    const actualHeight = await page.evaluate(() => {
      const element = document.getElementById('html-content');
      return element?.getBoundingClientRect().height || 0;
    });

    await page.setViewport({
      ...(size as any),
      height: Math.ceil(actualHeight),
      deviceScaleFactor: 2,
    });

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
    });

    if (!fromPool) {
      await page.close();
    } else {
      pagePool.push(page);
    }

    return {
      image: options.toBase64
        ? `data:image/png;base64,${Buffer.from(screenshot).toString('base64')}`
        : Buffer.from(screenshot),
      width: options.width || 1200,
      height: Math.ceil(actualHeight),
    };
  } catch (error) {
    if (!fromPool) {
      await page.close();
    } else {
      pagePool.push(page);
    }
    console.error('Error generating image from HTML:', error);
    throw error;
  }
}

process.on('exit', async () => {
  if (browser) {
    await browser.close();
    browser = null;
    pagePool = [];
  }
});
