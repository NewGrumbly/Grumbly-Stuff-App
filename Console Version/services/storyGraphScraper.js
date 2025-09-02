// services/storyGraphScraper.js
// Servicio para scrapear libros desde The StoryGraph

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

async function scrapeToReadList(username) {
  console.log('🚀 Iniciando scraping de The StoryGraph...');

  let browser;
  let page; 

  try {
    browser = await puppeteer.launch({ headless: "new" });
    page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1920, height: 1080 });

    // Flujo de Login
    console.log('🔐 Haciendo login en The StoryGraph...');
    await page.goto('https://app.thestorygraph.com/users/sign_in');
    
    await page.waitForSelector('#user_email');

    await page.type('#user_email', process.env.STORYGRAPH_EMAIL);
    await page.type('#user_password', process.env.STORYGRAPH_PASSWORD);

    await page.click('#sign-in-btn');
    console.log('⏳ Esperando la navegación post-login...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ ¡Login exitoso!');

    // Navegar al "To-Read Pile"
    const toReadUrl = `https://app.thestorygraph.com/to-read/${username}`;
    await page.goto(toReadUrl);
    
    // Esperar por el contenedor de la lista de libros
    await page.waitForSelector('div.to-read-books');
    
    // Lógica de "Infinite Scroll"
    let previousHeight;
    while (true) {
      const currentHeight = await page.evaluate('document.body.scrollHeight');
      if (currentHeight === previousHeight) {
        break; // Si la altura no cambia, hemos llegado al final
      }
      
      previousHeight = currentHeight;
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      
      // Esperar un momento para que los nuevos libros carguen (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000)); 
    }
    
    // Extracción final de datos
    console.log('🔍 Extrayendo los libros de la página...');
    const content = await page.content();
    const $ = cheerio.load(content);
    
    const allBooks = [];
    const bookSelector = 'div.book-pane';
    
    $(bookSelector).each((_, element) => {
      const bookPane = $(element);
      
      // Selector para el título del libro
      const titleSelector = 'div.book-title-author-and-series > h3 > a';
      const title = bookPane.find(titleSelector).first().text().trim();

      // Selector para el autor
      const authorSelector = 'div.book-title-author-and-series p a';
      const author = bookPane.find(authorSelector).first().text().trim();

      if (title) {
        // Guardamos el objeto con ambas propiedades
        allBooks.push({ title, author });
      }
    });

    console.log("✅ ¡Libros obtenidos!");
    return allBooks;

  } catch (error) {
    console.error(`❌ Error durante el scraping de The StoryGraph: ${error.message}`);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeToReadList };