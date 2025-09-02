// services/traktApi.js
// Servicio para interactuar con la API de Trakt

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Crear instancia de axios pre-configurada para la API de Trakt
const traktApiClient = axios.create({
  baseURL: 'https://api.trakt.tv',
  headers: {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
  },
});

class TraktService {
  constructor() {
    this.clientId = process.env.TRAKT_CLIENT_ID;
    this.clientSecret = process.env.TRAKT_CLIENT_SECRET;
    this.redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
    this.token = process.env.TRAKT_ACCESS_TOKEN ? JSON.parse(process.env.TRAKT_ACCESS_TOKEN.replace(/'/g, '"')) : null;
  }

  async saveTokenToEnv(token) {
    const tokenString = JSON.stringify(token);
    const envPath = path.join(process.cwd(), '.env');
    
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('TRAKT_ACCESS_TOKEN=')) {
        envContent = envContent.replace(/TRAKT_ACCESS_TOKEN=.*/, `TRAKT_ACCESS_TOKEN='${tokenString}'`);
      } else {
        envContent += `\nTRAKT_ACCESS_TOKEN='${tokenString}'`;
      }
      fs.writeFileSync(envPath, envContent);
      console.log('🔑 Token de Trakt.tv guardado en .env');
    } catch (error) {
      console.error('❌ No se pudo guardar el token en .env.', error);
      console.log('💡 Por favor, guárdalo manualmente:', `TRAKT_ACCESS_TOKEN='${tokenString}'`);
    }
  }

  async authenticate() {
    try {
      console.log('🚀 Iniciando autenticación con Trakt.tv...');
      // Obtener códigos de dispositivo
      const codeResponse = await traktApiClient.post('/oauth/device/code', {
        client_id: this.clientId,
      });
      const codes = codeResponse.data;

      console.log('📱 Para autorizar, ingresa el siguiente código en la URL de abajo:');
      console.log(`   Código: ${codes.user_code}`);
      console.log(`   URL: ${codes.verification_url}`);
      console.log('\n⏳ Esperando autorización del usuario...');

      // Sondear (poll) para obtener el token
      return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const tokenResponse = await traktApiClient.post('/oauth/device/token', {
              code: codes.device_code,
              client_id: this.clientId,
              client_secret: this.clientSecret,
            });

            // Si llegamos aquí, el usuario ha autorizado la app
            clearInterval(interval);
            const token = tokenResponse.data;
            console.log('✅ ¡Autorización exitosa!');
            this.token = token;
            await this.saveTokenToEnv(token);
            resolve();
          } catch (pollError) {
            // Mientras el usuario no autorice, la API devolverá errores 4xx
            // Los ignoramos hasta que el tiempo de espera se agote
            if (pollError.response && pollError.response.status === 400) {
              // Código 400 = pendiente, sigue esperando
            } else if (pollError.response && pollError.response.status === 410) {
              // Código 410 = el código ha expirado
              clearInterval(interval);
              reject(new Error('El código de autorización ha expirado.'));
            } else {
              clearInterval(interval);
              reject(pollError);
            }
          }
        }, codes.interval * 1000); // El intervalo de sondeo lo da la propia API
      });

    } catch (err) {
      console.error('❌ Error durante la autenticación de Trakt.tv:', err.response ? err.response.data : err.message);
      throw err;
    }
  }
  
  async initialize() {
    if (!this.token) {
      console.log('⚠️ No se encontró token de acceso para Trakt.tv.');
      await this.authenticate();
    } else {
      console.log('✅ Token de Trakt.tv cargado y listo.');
    }
  }

  async getShowWatchlist() {
    try {
      console.log('📺 Obteniendo watchlist de series de Trakt.tv...');
      const response = await traktApiClient.get('/users/me/watchlist/shows', {
        headers: {
          'Authorization': `Bearer ${this.token.access_token}`,
          'trakt-api-key': this.clientId,
        }
      });

      console.log(`✅ ¡Series obtenidas!`);
      return response.data
        .filter(item => item.type === 'show')
        .map(item => ({
          title: item.show.title,
          year: item.show.year,
        }));

    } catch (error) {
        console.error('❌ Error al obtener la watchlist de Trakt.tv:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 401) {
            console.log('⚠️ El token parece inválido o ha expirado. Re-autenticando...');
            await this.authenticate();
            return this.getShowWatchlist(); // Reintentar
        }
        return [];
    }
  }
}

module.exports = TraktService;