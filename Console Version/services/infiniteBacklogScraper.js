// infiniteBacklogScraper.js

const cheerio = require("cheerio"); // Importamos Cheerio para manipular el HTML
const puppeteer = require("puppeteer"); // Importamos Puppeteer para controlar el navegador

async function scrapeCollection(username, type) {
  console.log("Iniciando scraping de la colección...");

  // Definimos una variable para el navegador
  let browser;

  try {
    // Lanzamos una instancia del navegador
    browser = await puppeteer.launch({ headless: "new" });
    // Abrimos una nueva página
    const page = await browser.newPage();

    let currentPageUrl;
    // De acuerdo al valor de type, currentPageUrl cambia
    if (type === "wishlist") {
      currentPageUrl = `https://infinitebacklog.net/users/${username}/wishlist/`;
    } else if (type === "playing") {
      currentPageUrl = `https://infinitebacklog.net/users/${username}/collection?status=playing`;
    } else if (type === "unplayed") {
      currentPageUrl = `https://infinitebacklog.net/users/${username}/collection?status=unplayed`;
    }
    let allGames = []; // Lista para almacenar todos los juegos
    let hasNextPage = true; // Bandera para controlar la paginación

    // Navegamos a la URL de la colección
    await page.goto(currentPageUrl);

    // Mientras haya más páginas, seguimos scrapeando
    while (hasNextPage) {
      // Esperamos a que se cargue el contenedor de la colección
      await page.waitForSelector("div.collection-list"); 

      // Obtenemos el contenido HTML de la página
      const pageContent = await page.content();
      // Cargamos el HTML en Cheerio para poder manipularlo
      const $ = cheerio.load(pageContent);

      // Definimos el selector para los juegos según el tipo
      let gameItemSelector;
      if (type === "wishlist") {
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
    return allGames; // Devolvemos la lista de juegos
  } catch (error) {
    console.error(`Error durante el scraping: ${error.message}`);
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
  scrapeCollection,
};
