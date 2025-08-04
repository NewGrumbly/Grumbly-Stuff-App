// test-scraper.js

// Es importante cargar las variables de entorno, aunque esta función no las use directamente,
// es una buena práctica para que el entorno de prueba sea igual al de la app.
require('dotenv').config();

// Importamos la funcion de scraping desde el scraper de Infinite Backlog.
const { scrapeCollection } = require('./scrapers/infiniteBacklogScraper.js');

// Creamos una función principal asíncrona para poder usar 'await'.
async function runTest() {
  // --- ¡Aquí puedes cambiar los parámetros para probar diferentes casos! ---
  const username = process.env.INFINITE_BACKLOG_USERNAME;
  const typeToTest = 'playing'; // Prueba con 'wishlist', 'playing' o 'unplayed'

  console.log(`--- Iniciando prueba para la colección "${typeToTest}" del usuario "${username}" ---`);
  
  const games = await scrapeCollection(username, typeToTest);

  if (games && games.length > 0) {
    console.log(`\n✅ ¡Éxito! Se encontraron ${games.length} juegos.`);
    console.log("--- Mostrando los primeros 5 juegos encontrados: ---");
    console.log(games.slice(0, 5));
  } else {
    console.error("\n❌ No se encontraron juegos o hubo un error durante el scraping.");
  }
}

// Ejecutamos la prueba.
runTest();