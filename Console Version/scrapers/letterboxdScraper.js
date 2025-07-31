// letterboxdScraper.js

const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

async function scrapeWatchlist(username) {
  console.log("Iniciando scraping de la watchlist...");

  // Definimos una variable para el navegador.
  let browser;

  try {
    // Lanzamos una instancia del navegador.
    browser = await puppeteer.launch({ headless: "new" });

    // Abrimos una nueva página.
    const page = await browser.newPage();
    // URL actual de la watchlist
    let currentPageUrl = `https://letterboxd.com/${username}/watchlist/`;
    let allMovies = []; // Lista para almacenar todas las películas
    let hasNextPage = true; // Bandera para controlar la paginación
    let pageNumber = 1; // Contador de páginas

    while (hasNextPage) {
      // Navegamos a la URL de la watchlist
      await page.goto(currentPageUrl, { waitUntil: "domcontentloaded" });

      // Obtenemos el contenido HTML de la página
      const pageContent = await page.content();
      // Cargamos el HTML en Cheerio para poder manipularlo.
      const $ = cheerio.load(pageContent);

      // Buscamos los elementos que contienen los pósters de las películas
      const filmPosters = $(".poster-list .poster");

      // Iteramos sobre cada elemento encontrado
      filmPosters.each((_, element) => {
        const posterDiv = $(element); // Convertimos el elemento HTML a un objeto Cheerio

        // Extraemos el título de la película del atributo 'alt' de la imagen dentro del div.
        const title = posterDiv.find("img").attr("alt");

        // Si el título no es nulo, lo agregamos a la lista
        if (title) {
          allMovies.push({ title: title });
        }
      });

      // Buscamos el enlace de la siguiente página
      const nextPagePath = $(".paginate-nextprev a.next").attr("href");

      // Si hay un enlace a la siguiente página, actualizamos la URL y aumentamos el contador de páginas
      if (nextPagePath) {
        currentPageUrl = `https://letterboxd.com${nextPagePath}`;
        pageNumber++;
      } else {
        hasNextPage = false; // Si no hay más páginas, terminamos el bucle
      }
    }

    return allMovies;
  } catch (error) {
    console.error(`Error durante el scaping de la Watchlist: ${error.message}`);
    return [];
  } finally {
    // Cerramos el navegador
    if (browser) {
      await browser.close();
    }
  }
}

// Exportamos funciones
module.exports = {
  scrapeWatchlist,
};
