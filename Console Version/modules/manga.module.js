// modules/manga.module.js
// Módulo para gestionar mangas por consola

const inquirer = require('inquirer');
const { mostrarEncabezado } = require('../utils/cli.utils.js');
const AnilistService = require('../services/aniListApi.js');

const anilist = new AnilistService();
const username = process.env.ANILIST_USERNAME;
let planningCache = [];

async function gestionarManga() {
  let seguirEnModulo = true;
  while (seguirEnModulo) {
    mostrarEncabezado("📖 Módulo de Manga");
    const { opcion } = await inquirer.prompt([
      {
        type: 'list',
        name: 'opcion',
        message: '¿Qué te gustaría hacer?',
        choices: [
          { name: 'Sugerir manga aleatorio que tenga pendiente', value: 'aleatorio' },
          new inquirer.Separator(),
          { name: 'Volver al menú principal', value: 'volver' },
        ],
      },
    ]);

    switch (opcion) {
      case 'aleatorio':
        try {
          await anilist.initialize();

          if (planningCache.length === 0) {
            console.log('\nObteniendo tu lista "Planning" por primera vez...');
            planningCache = await anilist.getPlanningList(username, 'MANGA');
          }

          if (planningCache.length > 0) {
            const mangaAleatorio = planningCache[Math.floor(Math.random() * planningCache.length)];
            console.log('\n✨ ¡El manga sugerido es...! ✨');
            console.log(`\n\t-> ${mangaAleatorio.title}\n`);
          } else {
            console.log('\n❌ No se encontraron mangas en tu lista "Planning" o hubo un error.');
          }
        } catch (error) {
          console.error('\n❌ Ocurrió un error en el módulo de manga. No se pudo continuar.');
        }
        
        await inquirer.prompt([{ type: 'input', name: 'pausa', message: 'Presiona Enter para continuar...' }]);
        break;

      case 'volver':
        seguirEnModulo = false;
        break;
    }
  }
}

module.exports = { gestionarManga };