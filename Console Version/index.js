// index.js

require('dotenv').config(); // Cargar variables de entorno desde .env
const inquirer = require('inquirer'); // Importar inquirer para manejar la CLI
const { mostrarEncabezado } = require('./utils/cli.utils.js'); // Importar funciones de utilidades para mostrar encabezados
const { gestionarPeliculas } = require('./modules/movies.module.js'); // Importar el módulo de gestión de películas
const { gestionarJuegos } = require('./modules/games.module.js'); // Importar el módulo de gestión de juegos
const { gestionarSeries } = require('./modules/series.module.js'); // Importar el módulo de gestión de series
const { gestionarLibros } = require('./modules/books.module.js'); // Importar el módulo de gestión de libros

async function main() { 
  let seguirEnApp = true;
  while (seguirEnApp) { 
    mostrarEncabezado("Grumbly's Stuff App");
    const { modulo } = await inquirer.prompt([ // Pregunta para seleccionar el módulo
      {
        type: 'list',
        name: 'modulo',
        message: 'Escoge un módulo',
        choices: [
          { name: '🎬 Películas', value: 'peliculas' },
          { name: '🎮 Juegos', value: 'juegos' },
          { name: '📺 Series', value: 'series'},
          { name: '📚 Libros', value: 'libros'},
          new inquirer.Separator(), // Separador visual
          { name: 'Salir del programa', value: 'salir' },
        ],
      },
    ]);

    switch (modulo) {
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
      case 'salir':
        seguirEnApp = false;
        break;
    }
  }
  console.log("\n¡Chao pescao!"); 
}

main();