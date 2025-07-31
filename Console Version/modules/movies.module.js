// modules/movies.module.js

const inquirer = require('inquirer');
const { mostrarEncabezado, mostrarListaPaginada } = require('../utils/cli.utils.js');
const { scrapeWatchlist } = require('../scrapers/letterboxdScraper.js');

const username = process.env.LETTERBOXD_USERNAME;
let watchlistCache = [];

async function gestionarPeliculas() {
  let seguirEnModulo = true;
  while (seguirEnModulo) {
    mostrarEncabezado("🎬 Módulo de Películas");

    const { opcion } = await inquirer.prompt([
      {
        type: 'list',
        name: 'opcion',
        message: '¿Qué te gustaría hacer?',
        choices: [
          { name: 'Ver mi Watchlist (paginada)', value: 'verWatchlist' },
          { name: 'Escoger una película aleatoria de la Watchlist', value: 'aleatoria' },
          new inquirer.Separator(),
          { name: 'Volver al menú principal', value: 'volver' },
        ],
      },
    ]);

    switch (opcion) {
      case 'verWatchlist':
        if (watchlistCache.length === 0) {
          console.log("Obteniendo tu watchlist por primera vez. Esto puede tardar un momento...");
          watchlistCache = await scrapeWatchlist(username);
        }
        if (watchlistCache.length > 0) {
          await mostrarListaPaginada(watchlistCache, `Watchlist de ${username}`);
        } else {
          console.log("\nNo se pudo obtener la watchlist. Revisa tu usuario en el .env o tu conexión.");
          await inquirer.prompt([{ type: 'input', name: 'pausa', message: 'Presiona Enter para continuar...' }]);
        }
        break;

      case 'aleatoria':
        if (watchlistCache.length === 0) {
          console.log("Obteniendo tu watchlist por primera vez. Esto puede tardar un momento...");
          watchlistCache = await scrapeWatchlist(username);
        }
        if (watchlistCache.length > 0) {
          const peliAleatoria = watchlistCache[Math.floor(Math.random() * watchlistCache.length)];
          console.log("\n✨ ¡La película elegida es! ✨");
          console.log(`\n\t-> ${peliAleatoria.title}\n`);
        } else {
          console.log("\nNo se pudo obtener la watchlist para elegir una película.");
        }
        await inquirer.prompt([{ type: 'input', name: 'pausa', message: 'Presiona Enter para continuar...' }]);
        break;

      case 'volver':
        seguirEnModulo = false;
        break;
    }
  }
}

module.exports = {
  gestionarPeliculas,
};