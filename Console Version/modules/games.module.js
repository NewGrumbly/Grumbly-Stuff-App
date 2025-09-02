// modules/games.module.js

const inquirer = require('inquirer');
const { mostrarEncabezado } = require('../utils/cli.utils.js');
const { scrapeGames } = require('../services/infiniteBacklogScraper.js');

const username = process.env.INFINITE_BACKLOG_USERNAME;
// Crear cachés separadas para cada tipo de lista
let unplayedCache = [];
let wishlistCache = [];

async function gestionarJuegos() {
  let seguirEnModulo = true;
  while (seguirEnModulo) {
    mostrarEncabezado("🎮 Módulo de Juegos");

    const { opcion } = await inquirer.prompt([
      {
        type: 'list',
        name: 'opcion',
        message: '¿Qué te gustaría hacer?',
        choices: [
          { name: 'Sugerir juego aleatorio de mi Backlog', value: 'aleatorioUnplayed' },
          { name: 'Sugerir juego aleatorio de mi Wishlist', value: 'aleatorioWishlist' },
          new inquirer.Separator(),
          { name: 'Volver al menú principal', value: 'volver' },
        ],
      },
    ]);

    switch (opcion) {
      case 'aleatorioUnplayed':
      case 'aleatorioWishlist':
        // Determinar qué caché y qué status usar basado en la opción elegida
        const isUnplayed = opcion === 'aleatorioUnplayed';
        let cache = isUnplayed ? unplayedCache : wishlistCache;
        const status = isUnplayed ? 'unplayed' : 'wishlist';

        try {
          // Si la caché correspondiente está vacía, ejecutar scraping
          if (cache.length === 0) {
            console.log(`\nObteniendo la lista "${status}" por primera vez...`);
            cache = await scrapeGames(username, status);
            
            // Actualizar caché después del scraping
            if (isUnplayed) {
              unplayedCache = cache;
            } else {
              wishlistCache = cache;
            }
          }

          if (cache.length > 0) {
            const juegoAleatorio = cache[Math.floor(Math.random() * cache.length)];
            console.log(`\n✨ ¡El juego sugerido de la lista "${status}" es! ✨`);
            console.log(`\n\t-> ${juegoAleatorio.title}\n`);
          } else {
            console.log(`\n❌ No se encontraron juegos en la lista "${status}" o hubo un error.`);
          }
        } catch (error) {
          console.error(`\n❌ Ocurrió un error general en el módulo de juegos:`, error.message);
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
  gestionarJuegos,
};