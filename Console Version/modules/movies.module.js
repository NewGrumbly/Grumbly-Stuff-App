// modules/movies.module.js
// Módulo para gestionar películas por consola

const inquirer = require('inquirer');
const { mostrarEncabezado, mostrarListaPaginada } = require('../utils/cli.utils.js');
const TMDBAPI = require('../services/tmdbApi.js');
const tmdb = new TMDBAPI();


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
          { name: 'Sugerir una película aleatoria de mi Watchlist', value: 'aleatoria' },
          new inquirer.Separator(),
          { name: 'Volver al menú principal', value: 'volver' },
        ],
      },
    ]);

    switch (opcion) {
      case 'aleatoria':
        try {
          // Asegurar autenticación
          await tmdb.initialize(); 

          // Obtener la watchlist.
          const watchlistData = await tmdb.getMovieWatchlist();

          // Validar la respuesta y las películas
          if (watchlistData.success && watchlistData.movies.length > 0) {
            const movies = watchlistData.movies;
            // Seleccionar una película aleatoria
            const peliAleatoria = movies[Math.floor(Math.random() * movies.length)];
            
            console.log("\n✨ ¡La película sugerida es...! ✨");
            console.log(`\n\t-> ${peliAleatoria.title} (${peliAleatoria.year})\n`);
          } else {
            // Manejar en caso de error
            console.log("\n❌ No se encontraron películas en tu watchlist de TMDB o hubo un error.");
          }
        } catch (error) {
          // Manejar errores durante la inicialización
          console.error("\n❌ Ocurrió un error durante el proceso:", error.message);
        }
      // Pausa para leer el resultado
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