// tmdbApi.js
// Módulo para comunicarse con la API de The Movie Database (TMDB)

const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class TMDBAPI {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.sessionId = process.env.TMDB_SESSION_ID;
    this.baseURL = 'https://api.themoviedb.org/3';
    
    if (!this.apiKey) {
      throw new Error('TMDB_API_KEY no está configurada en el archivo .env');
    }
  }

  // Método para crear una interfaz de lectura
  createInterface() {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // Guardar automáticamente el session ID en el archivo .env
  async saveSessionIdToEnv(sessionId) {
    try {
      // Buscar el archivo .env en el directorio raíz del proyecto
      let envPath = '.env';
      let currentDir = __dirname;
      
      // Subir directorios hasta encontrar el archivo .env
      while (currentDir !== path.dirname(currentDir)) {
        const testPath = path.join(currentDir, '.env');
        if (fs.existsSync(testPath)) {
          envPath = testPath;
          break;
        }
        currentDir = path.dirname(currentDir);
      }
      
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Agregar o actualizar TMDB_SESSION_ID
      if (envContent.includes('TMDB_SESSION_ID=')) {
        // Reemplazar la línea existente
        envContent = envContent.replace(
          /TMDB_SESSION_ID=.*/,
          `TMDB_SESSION_ID="${sessionId}"`
        );
      } else {
        // Agregar nueva línea
        envContent += `\nTMDB_SESSION_ID="${sessionId}"`;
      }
      
      // Escribir el archivo
      fs.writeFileSync(envPath, envContent);
      console.log('💾 Session ID guardado automáticamente en .env');
      
      // Recargar las variables de entorno
      require('dotenv').config({ path: envPath });
      
      return true;
    } catch (error) {
      console.log('⚠️  No se pudo guardar automáticamente en .env');
      console.log('💡 Guarda manualmente: TMDB_SESSION_ID=' + sessionId);
      return false;
    }
  }

  // Obtener request token automáticamente
  async getRequestToken() {
    try {
      console.log('🔑 Obteniendo request token...');
      const response = await axios.get(`${this.baseURL}/authentication/token/new`, {
        params: { api_key: this.apiKey }
      });

      if (response.data.success) {
        console.log('✅ Request token obtenido exitosamente');
        return response.data.request_token;
      } else {
        throw new Error('No se pudo obtener el request token');
      }
    } catch (error) {
      console.error('❌ Error al obtener request token:', error.message);
      throw error;
    }
  }

  // Crear sesión automáticamente
  async createSession(requestToken) {
    try {
      console.log('🔐 Creando sesión...');
      const response = await axios.post(`${this.baseURL}/authentication/session/new`, {
        request_token: requestToken
      }, {
        params: { api_key: this.apiKey },
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        console.log('✅ Sesión creada exitosamente');
        return response.data.session_id;
      } else {
        throw new Error('No se pudo crear la sesión');
      }
    } catch (error) {
      console.error('❌ Error al crear sesión:', error.message);
      throw error;
    }
  }

  // Proceso completo de autenticación automática
  async authenticateAutomatically() {
    try {
      console.log('🚀 Iniciando proceso de autenticación automática...\n');
      
      // Paso 1: Obtener request token
      const requestToken = await this.getRequestToken();
      
      // Paso 2: Mostrar URL para autorización
      const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}`;
      console.log('📱 Para autorizar esta aplicación:');
      console.log(`🌐 Visita: ${authUrl}`);
      console.log('👤 Inicia sesión en tu cuenta de TMDB y autoriza la aplicación\n');
      
      // Paso 3: Esperar confirmación del usuario
      const rl = this.createInterface();
      await new Promise((resolve) => {
        rl.question('✅ ¿Ya autorizaste la aplicación? (presiona Enter cuando esté listo): ', () => {
          rl.close();
          resolve();
        });
      });
      
      // Paso 4: Crear sesión
      const sessionId = await this.createSession(requestToken);
      
      // Paso 5: Guardar session ID automáticamente
      this.sessionId = sessionId;
      console.log(`💾 Session ID obtenido: ${sessionId}`);
      
      // Guardar automáticamente en .env
      const saved = await this.saveSessionIdToEnv(sessionId);
      if (saved) {
        console.log('🎉 ¡Configuración completada automáticamente!');
        console.log('✅ No necesitas hacer nada más, la app recordará tu sesión\n');
      }
      
      return sessionId;
    } catch (error) {
      console.error('❌ Error en la autenticación automática:', error.message);
      throw error;
    }
  }

  // Inicializar automáticamente (obtener session ID si no existe)
  async initialize() {
    if (!this.sessionId) {
      console.log('⚠️  No se encontró TMDB_SESSION_ID, iniciando autenticación automática...\n');
      await this.authenticateAutomatically();
    } else {
      console.log('✅ Session ID encontrado, validando credenciales...');
      const validation = await this.validateCredentials();
      if (!validation.success) {
        console.log('⚠️  Session ID inválido, iniciando nueva autenticación...\n');
        await this.authenticateAutomatically();
      } else {
        console.log('✅ Credenciales válidas');
      }
    }
  }

  // Obtener el watchlist de películas del usuario
  async getMovieWatchlist() {
    try {
      // Asegurar que tenemos un session ID válido
      if (!this.sessionId) {
        await this.initialize();
      }

      console.log('🎬 Obteniendo películas del watchlist de TMDB...');
      const response = await axios.get(`${this.baseURL}/account/${this.sessionId}/watchlist/movies`, {
        params: {
          api_key: this.apiKey,
          session_id: this.sessionId,
          language: 'en-US',
          sort_by: 'created_at.desc'
        }
      });

      if (response.data && response.data.results) {
        const movies = response.data.results.map(movie => ({
          title: movie.title,
          year: movie.release_date ? movie.release_date.slice(0, 4) : null
        }));

        console.log(`✅ ¡Películas obtenidas!`);
        return {
          success: true,
          total_results: response.data.total_results,
          total_pages: response.data.total_pages,
          page: response.data.page,
          movies: movies
        };
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('❌ Error al obtener el watchlist de películas:', error.message);
      return {
        success: false,
        error: error.message,
        movies: []
      };
    }
  }

  // Validar que la API key y session ID sean válidos
  async validateCredentials() {
    try {
      if (!this.sessionId) {
        return { success: false, error: 'No hay session ID configurado' };
      }

      const response = await axios.get(`${this.baseURL}/account`, {
        params: {
          api_key: this.apiKey,
          session_id: this.sessionId
        }
      });

      return {
        success: true,
        account: response.data
      };
    } catch (error) {
      console.error('❌ Error al validar credenciales:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = TMDBAPI;
