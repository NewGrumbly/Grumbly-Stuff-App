// modules/anime.module.js
// Módulo para gestionar animes por consola

const inquirer = require('inquirer');
const { mostrarEncabezado } = require('../utils/cli.utils.js');
const AnilistService = require('../services/aniListApi.js');

const anilist = new AnilistService();
const username = process.env.ANILIST_USERNAME;
let planningCache = [];

async function gestionarAnime() {
  let seguirEnModulo = true;
  while (seguirEnModulo) {
    mostrarEncabezado("🌸 Módulo de Anime");
    const { opcion } = await inquirer.prompt([
      {
        type: 'list',
        name: 'opcion',
        message: '¿Qué te gustaría hacer?',
        choices: [
          { name: 'Sugerir anime aleatorio que tenga pendiente', value: 'aleatorio' },
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
            planningCache = await anilist.getPlanningList(username, 'ANIME');
          }

          if (planningCache.length > 0) {
            const animeAleatorio = planningCache[Math.floor(Math.random() * planningCache.length)];
            console.log('\n✨ ¡El anime sugerido es...! ✨');
            console.log(`\n\t-> ${animeAleatorio.title}\n`);
          } else {
            console.log('\n❌ No se encontraron animes en tu lista "Planning" o hubo un error.');
          }
        } catch (error) {
          console.error('\n❌ Ocurrió un error en el módulo de anime. No se pudo continuar.');
        }
        
        await inquirer.prompt([{ type: 'input', name: 'pausa', message: 'Presiona Enter para continuar...' }]);
        break;

      case 'volver':
        seguirEnModulo = false;
        break;
    }
  }
}

module.exports = { gestionarAnime };