// modules/series.module.js
// Módulo para gestionar series por consola


const inquirer = require('inquirer');
const { mostrarEncabezado } = require('../utils/cli.utils.js');
const TraktService = require('../services/traktApi.js');

const trakt = new TraktService();

async function gestionarSeries() {
  let seguirEnModulo = true;
  while (seguirEnModulo) {
    mostrarEncabezado("📺 Módulo de Series");

    const { opcion } = await inquirer.prompt([
      {
        type: 'list',
        name: 'opcion',
        message: '¿Qué te gustaría hacer?',
        choices: [
          { name: 'Sugerir serie aleatoria de mi Watchlist', value: 'aleatoria' },
          new inquirer.Separator(),
          { name: 'Volver al menú principal', value: 'volver' },
        ],
      },
    ]);

    switch (opcion) {
      case 'aleatoria':
        try {
          await trakt.initialize(); // Asegura que estemos autenticados
          const shows = await trakt.getShowWatchlist();

          if (shows && shows.length > 0) {
            const serieAleatoria = shows[Math.floor(Math.random() * shows.length)];
            console.log('\n✨ ¡La serie sugerida de tu Watchlist es...! ✨');
            console.log(`\n\t-> ${serieAleatoria.title} (${serieAleatoria.year})\n`);
          } else {
            console.log('\n❌ No se encontraron series en tu watchlist de Trakt.tv o hubo un error\n');
          }
        } catch (error) {
          console.error('\n❌ Ocurrió un error en el módulo de series.');
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
  gestionarSeries,
};