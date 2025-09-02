// test-storygraph.js

require('dotenv').config();

// Importamos la nueva función del scraper de The StoryGraph.
// Asegúrate de que la ruta sea correcta según tu estructura de carpetas.
const { scrapeToReadList } = require('./services/storyGraphScraper.js');

// Necesitamos el nombre de usuario para pasárselo a la función.
// Lo sacamos del email en el .env para no tener que añadir otra variable.
const email = process.env.STORYGRAPH_EMAIL;
// Extraemos la parte antes del '@' como nombre de usuario. 
// ¡Asegúrate de que esto coincida con tu URL de The StoryGraph!
// Si tu usuario es diferente, puedes cambiarlo aquí directamente.
const username = "grumbly";

/**
 * Función principal para ejecutar la prueba del scraper de The StoryGraph.
 */
async function runStoryGraphTest() {
  // Verificamos que las credenciales y el usuario existan.
  if (!process.env.STORYGRAPH_EMAIL || !process.env.STORYGRAPH_PASSWORD) {
    console.error("❌ Por favor, asegúrate de que STORYGRAPH_EMAIL y STORYGRAPH_PASSWORD están en tu archivo .env");
    return;
  }
  if (!username) {
    console.error("❌ No se pudo extraer el nombre de usuario del email en el .env");
    return;
  }

  console.log(`--- Iniciando prueba para la lista "To-Read" del usuario "${username}" ---`);
  
  // Llamamos a la función de scraping.
  const books = await scrapeToReadList(username);

  if (books && books.length > 0) {
    console.log(`\n✅ ¡Éxito! Se encontraron ${books.length} libros en total.`);
    console.log("\n--- Mostrando los primeros 5 libros encontrados: ---");
    console.log(books.slice(0, 5));
    console.log("\n--- Mostrando los últimos 5 libros encontrados: ---");
    console.log(books.slice(-5));
  } else {
    console.error("\n❌ No se encontraron libros o hubo un error durante el scraping.");
  }
}

// Ejecutamos la prueba.
runStoryGraphTest();