// infiniteBacklogScraper.js

const cheerio = require("cheerio"); // Importamos Cheerio para manipular el HTML
const puppeteer = require("puppeteer"); // Importamos Puppeteer para controlar el navegador

// Definimos un user-agent común para evitar bloqueos
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

async function scrapeGames(username, status) {

  if (status !== 'unplayed' && status !== 'wishlist') {
    console.error("❌ Status inválido. Debe ser 'unplayed' o 'wishlist'.");
    return [];
  }

  console.log(`🚀 Iniciando scraping para la colección ${status} de ${username}...`);

  // Definimos una variable para el navegador
  let browser;

  try {
    // Lanzamos una instancia del navegador
    browser = await puppeteer.launch({ headless: "new" });
    // Abrimos una nueva página
    const page = await browser.newPage();

    // Establecer el user-agent
    await page.setUserAgent(USER_AGENT);
    // Establecer viewport realista
    await page.setViewport({ width: 1920, height: 1080});
    // Script para evadir detección de WebDriver
    await page.evaluateOnNewDocument(() => {
      Object.definteProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    let initialUrl;
    // De acuerdo al valor de status, initialUrl cambia
    if (status === "wishlist") {
      initialUrl = `https://infinitebacklog.net/users/${username}/wishlist/`;
    } else if (status === "unplayed") {
      initialUrl = `https://infinitebacklog.net/users/${username}/collection?status=unplayed`;
    }

    let allGames = []; // Lista para almacenar todos los juegos
    let hasNextPage = true; // Bandera para controlar la paginación

    // Navegamos a la URL de la colección
    await page.goto(initialUrl);

    // Mientras haya más páginas, seguimos scrapeando
    while (hasNextPage) {
      // Esperamos a que se cargue el contenedor de la colección
      await page.waitForSelector("div.collection-list"); 

      // Pausa para que se renderice todo
      await new Promise(resolve => setTimeout(resolve, 500));

      // Obtenemos el contenido HTML de la página
      const pageContent = await page.content();
      // Cargamos el HTML en Cheerio para poder manipularlo
      const $ = cheerio.load(pageContent);

      // Definimos el selector para los juegos según el status
      let gameItemSelector;
      if (status === "wishlist") {
        gameItemSelector = "div.coll-game.wishlist-item";
      } else {
        gameItemSelector = "div.coll-game.collection-list-item";
      }
      // Buscamos el contendor de todos los juegos
      const gamesContainer = $("div.collection-list");
      // Buscamos los elementos que contienen a cada juego
      const gameItems = gamesContainer.find(gameItemSelector);

      // Iteramos sobre cada elemento encontrado
      gameItems.each((_, element) => {
        const gameDiv = $(element); // Convertimos el elemento HTML a un objeto Cheerio

        // Extraer título del juego, buscar el 'h5'
        const title = gameDiv.find("h5").text().trim();

        // Si el título no es nulo, lo agregamos a la lista
        if (title) {
          allGames.push({ title: title });
        }
      });

      // Buscamos el enlace de la siguiente página
      const nextButtonSelector = 'li.page-item:not(.disabled) a[aria-label="Next"]';

      // Usamos page.$ para ver si el elemento existe en el DOM de Puppeteer
      const nextButton = await page.$(nextButtonSelector);

      // Si hay un enlace a la siguiente página, actualizamos la URL y aumentamos el contador de páginas
      if (nextButton) {
        // Hacemos clic.
        await nextButton.click();
      } else {
        hasNextPage = false; // Si no hay más páginas, terminamos el bucle
      }
    }
    console.log(`✅ ¡Juegos obtenidos!`);
    return allGames; // Devolvemos la lista de juegos
  } catch (error) {
    console.error(`❌ Error durante el scraping de juegos: ${error.message}`);
    return [];
  } finally {
    // Cerramos el navegador
    if (browser) {
      await browser.close();
    }
  }
}

// Exportamos la función
module.exports = {
  scrapeGames,
};
