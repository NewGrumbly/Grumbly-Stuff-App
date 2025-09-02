// modules/books.module.js
// Módulo para gestionar libros por consola

const inquirer = require('inquirer');
const { mostrarEncabezado } = require('../utils/cli.utils.js');
const { scrapeToReadList } = require('../services/storyGraphScraper.js');

const username = process.env.STORYGRAPH_USERNAME;
// Caché para la lista de libros pendientes
let toReadCache = [];

async function gestionarLibros() {
  let seguirEnModulo = true;
  while (seguirEnModulo) {
    mostrarEncabezado("📚 Módulo de Libros");

    const { opcion } = await inquirer.prompt([
      {
        type: 'list',
        name: 'opcion',
        message: '¿Qué te gustaría hacer?',
        choices: [
          { name: 'Sugerir libro aleatorio de mis pendientes', value: 'aleatorio' },
          new inquirer.Separator(),
          { name: 'Volver al menú principal', value: 'volver' },
        ],
      },
    ]);

    switch (opcion) {
      case 'aleatorio':
        try {
          // Si la caché está vacía, ejecutar scraper
          if (toReadCache.length === 0) {
            console.log('\nObteniendo tus libros pendientes por primera vez...');
            toReadCache = await scrapeToReadList(username);
          }

          if (toReadCache.length > 0) {
            const libroAleatorio = toReadCache[Math.floor(Math.random() * toReadCache.length)];
            console.log('\n✨ ¡El libro sugerido de tu lista de pendientes es! ✨');
            console.log(`\n\t-> "${libroAleatorio.title}" de ${libroAleatorio.author}\n`);
          } else {
            console.log('\n❌ No se encontraron libros en tu lista o hubo un error durante el scraping.');
          }
        } catch (error) {
          console.error('\n❌ Ocurrió un error general en el módulo de libros:', error.message);
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
  gestionarLibros,
};