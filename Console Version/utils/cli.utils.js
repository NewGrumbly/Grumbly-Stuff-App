// cli.utils.js

// Importamos las dependencias necesarias
const inquirer = require('inquirer');

// Muestra un encabezado en la consola con un título dado.
function mostrarEncabezado(titulo) {
  console.log(titulo);
  console.log("=".repeat(titulo.length));
  console.log("\n");
}

// Muestra una lista paginada de elementos en la consola
async function mostrarListaPaginada(items, titulo, pageSize = 10) {
  let paginaActual = 0; 
  const totalPaginas = Math.ceil(items.length / pageSize); 

  let salir = false;
  while (!salir) { // Bucle para mostrar las páginas
    mostrarEncabezado(titulo);

    const inicio = paginaActual * pageSize; // Calcula el índice de inicio para la página actual
    const fin = inicio + pageSize; // Calcula el índice final para la página actual
    const itemsPagina = items.slice(inicio, fin); // Obtiene los elementos de la página actual

    itemsPagina.forEach((item, index) => { // Itera sobre los elementos de la página actual
      console.log(`${inicio + index + 1}. ${item.title}`); 
    });

    console.log(`\n--- Página ${paginaActual + 1} de ${totalPaginas} ---`);

    const opciones = []; // Array para las opciones del menú
    if (paginaActual > 0) { // Si no estamos en la primera página, añadimos la opción de ir a la página anterior
      opciones.push({ name: 'Página Anterior', value: 'anterior' });
    }
    if (paginaActual < totalPaginas - 1) { // Si no estamos en la última página, añadimos la opción de ir a la página siguiente
      opciones.push({ name: 'Página Siguiente', value: 'siguiente' });
    }
    opciones.push({ name: 'Volver al menú', value: 'salir' }); // Añadimos la opción de salir del bucle

    const { accion } = await inquirer.prompt([ // Pregunta al usuario qué acción desea realizar
      {
        type: 'list',
        name: 'accion',
        message: '¿Qué deseas hacer?',
        choices: opciones,
      },
    ]);

    switch (accion) { // Controla la acción seleccionada por el usuario
      case 'siguiente':
        paginaActual++;
        break;
      case 'anterior':
        paginaActual--;
        break;
      case 'salir':
        salir = true;
        break;
    }
  }
}


// Exportamos la función
module.exports = {
  mostrarEncabezado,
  mostrarListaPaginada
};