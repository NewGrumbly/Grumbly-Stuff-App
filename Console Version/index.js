// index.js

require('dotenv').config(); // Cargar variables de entorno desde .env
const inquirer = require('inquirer'); // Importar inquirer para manejar la CLI
const { mostrarEncabezado } = require('./utils/cli.utils.js'); // Importar funciones de utilidades para mostrar encabezados
const { gestionarPeliculas } = require('./modules/movies.module.js'); // Importar el módulo de gestión de películas

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
          { name: 'Películas', value: 'peliculas' },
          { name: 'Juegos (Próximamente)', value: 'juegos', disabled: true },
          new inquirer.Separator(), // Separador visual
          { name: 'Salir del programa', value: 'salir' },
        ],
      },
    ]);

    switch (modulo) {
      case 'peliculas':
        await gestionarPeliculas(); 
        break;
      case 'salir':
        seguirEnApp = false;
        break;
      // Aquí podrías añadir: case 'juegos': await gestionarJuegos(); break;
    }
  }
  console.log("\n¡Hasta la próxima!"); 
}

main();