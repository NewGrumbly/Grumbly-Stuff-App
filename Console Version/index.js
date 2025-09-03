// index.js

require('dotenv').config(); // Cargar variables de entorno desde .env
const inquirer = require('inquirer'); // Importar inquirer para manejar la CLI
const { mostrarEncabezado } = require('./utils/cli.utils.js'); // Importar funciones de utilidades para mostrar encabezados
const { gestionarPeliculas } = require('./modules/movies.module.js'); // Importar el módulo de gestión de películas
const { gestionarJuegos } = require('./modules/games.module.js'); // Importar el módulo de gestión de juegos
const { gestionarSeries } = require('./modules/series.module.js'); // Importar el módulo de gestión de series
const { gestionarLibros } = require('./modules/books.module.js'); // Importar el módulo de gestión de libros
const { gestionarAnime } = require('./modules/anime.module.js'); // Importar el módulo de gestión de anime
const { gestionarManga } = require('./modules/manga.module.js'); // Importar el módulo de gestión de manga

async function main() { 
  let seguirEnApp = true;
  while (seguirEnApp) { 
    mostrarEncabezado("\nGrumbly's Stuff App");
    const { modulo } = await inquirer.prompt([ // Pregunta para seleccionar el módulo
      {
        type: 'list',
        name: 'modulo',
        message: '¿Qué quieres hacer hoy?',
        choices: [
          { name: '✨ Sugerir actividad aleatoria', value: 'aleatorio' },
          new inquirer.Separator(),
          { name: '🎬 Películas', value: 'peliculas' },
          { name: '🎮 Juegos', value: 'juegos' },
          { name: '📺 Series', value: 'series'},
          { name: '📚 Libros', value: 'libros'},
          { name: '🌸 Anime', value: 'anime'},
          { name: '📖 Manga', value: 'manga'},
          new inquirer.Separator(), // Separador visual
          { name: 'Salir del programa', value: 'salir' },
        ],
      },
    ]);

    switch (modulo) {
      case 'aleatorio':
        let seguirSugiriendo = true;
        while (seguirSugiriendo){
          const modulosDisponibles = ['peliculas', 'series', 'libros', 'anime', 'manga'];
          const moduloElegido = modulosDisponibles[Math.floor(Math.random() * modulosDisponibles.length)];
          const nombresModulos = {
            peliculas: '🎬 Películas',
            series: '📺 Series',
            anime: '🌸 Anime',
            manga: '📖 Manga',
            juegos: '🎮 Juegos',
            libros: '📚 Libros',
          };

          console.log(`\n🎉 ¡La actividad sugerida es: ${nombresModulos[moduloElegido]}! 🎉\n`);

          if (moduloElegido !== 'peliculas') {
          console.log("💡 Si ya estás con algo en este módulo, ¡sigue con ello! Si no, puedes buscar algo nuevo.");
          }

          // Nuevo menú de acción post-sugerencia
          const { accion } = await inquirer.prompt([
            {
              type: 'list',
              name: 'accion',
              message: '¿Qué deseas hacer ahora?',
              choices: [
                { name: `Entrar al módulo de ${nombresModulos[moduloElegido]}`, value: 'entrar' },
                { name: 'Intentar de nuevo', value: 'reintentar' },
                { name: 'Volver al menú principal', value: 'volver' },
              ]
            }
          ]);

          if (accion === 'reintentar') {
            continue; // Vuelve al inicio del bucle 'while (seguirSugiriendo)'
          }

          if (accion === 'volver') {
            seguirSugiriendo = false; // Rompe el bucle de sugerencias
            continue; // Vuelve al menú principal
          }

          // Si la opción es 'entrar', salimos del bucle y ejecutamos el módulo
          seguirSugiriendo = false; 
          switch (moduloElegido) {
            case 'peliculas': await gestionarPeliculas(); break;
            case 'series': await gestionarSeries(); break;
            case 'anime': await gestionarAnime(); break;
            case 'manga': await gestionarManga(); break;
            case 'juegos': await gestionarJuegos(); break;
            case 'libros': await gestionarLibros(); break;
          }
        }
        break;
      case 'peliculas':
        await gestionarPeliculas(); 
        break;
      case 'juegos':
        await gestionarJuegos();
        break;
      case 'series':
        await gestionarSeries();
        break;
      case 'libros':
        await gestionarLibros();
        break;
      case 'anime':
        await gestionarAnime();
        break;
      case 'manga':
        await gestionarManga();
        break;
      case 'salir':
        seguirEnApp = false;
        break;
    }
  }
  console.log("\n¡Chao pescao!"); 
}

main();