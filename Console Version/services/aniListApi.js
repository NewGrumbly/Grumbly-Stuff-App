// services/anilist.service.js
// Servicio para interactuar con la API de AniList

const axios = require('axios');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_URL = 'https://graphql.anilist.co';
const AUTH_URL = 'https://anilist.co/api/v2/oauth/authorize';
const TOKEN_URL = 'https://anilist.co/api/v2/oauth/token';

class AnilistService {
  constructor() {
    this.clientId = process.env.ANILIST_CLIENT_ID;
    this.clientSecret = process.env.ANILIST_CLIENT_SECRET;
    // Carga el token desde .env y lo parsea si existe.
    try {
      this.token = process.env.ANILIST_TOKEN ? JSON.parse(process.env.ANILIST_TOKEN.replace(/'/g, '"')) : null;
    } catch (e) {
      this.token = null;
    }
  }

  async saveTokenToEnv(token) {
    const tokenString = JSON.stringify(token);
    const envPath = path.join(process.cwd(), '.env');
    try {
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('ANILIST_TOKEN=')) {
        envContent = envContent.replace(/ANILIST_TOKEN=.*/, `ANILIST_TOKEN='${tokenString}'`);
      } else {
        envContent += `\nANILIST_TOKEN='${tokenString}'`;
      }
      fs.writeFileSync(envPath, envContent);
      console.log('🔑 Token de AniList guardado en .env');
    } catch (error) {
      console.error('❌ No se pudo guardar el token en .env.', error);
    }
  }

  async authenticate() {
    try {
      console.log('🚀 Iniciando autenticación con AniList...');
      const authUrl = `${AUTH_URL}?client_id=${this.clientId}&response_type=code`;
      
      console.log('📱 Para autorizar esta aplicación, sigue estos pasos:');
      console.log(`   1. Visita esta URL en tu navegador: ${authUrl}`);
      console.log('   2. Inicia sesión y autoriza la aplicación.');
      console.log('   3. Serás redirigido a una página que no existe. Copia el CÓDIGO de la URL.');
      console.log('      (Ej: https://example.com/?code=ESTE_ES_EL_CODIGO_QUE_NECESITAS)');

      const { authorizationCode } = await inquirer.prompt([{
        type: 'input',
        name: 'authorizationCode',
        message: '👇 Pega el código de autorización aquí:',
      }]);

      console.log('🔄 Intercambiando código por token de acceso...');
      const response = await axios.post(TOKEN_URL, {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: 'https://localhost',
        code: authorizationCode.trim(),
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const token = response.data;
      if (!token.access_token) throw new Error('No se pudo obtener el token de acceso.');

      console.log('✅ ¡Autenticación exitosa!');
      this.token = token;
      await this.saveTokenToEnv(token);
      
    } catch (err) {
      console.error('❌ Error durante la autenticación de AniList:', err.response ? err.response.data : err.message);
      throw err;
    }
  }

  async initialize() {
    if (!this.token || !this.token.access_token) {
      console.log('⚠️ No se encontró token de acceso para AniList.');
      await this.authenticate();
    } else {
      console.log('✅ Token de AniList cargado y listo.');
    }
  }

  async getPlanningList(username, type) {
    const query = `
      query ($userName: String, $type: MediaType) {
        MediaListCollection(userName: $userName, type: $type, status: PLANNING, sort: UPDATED_TIME_DESC) {
          lists {
            entries {
              media {
                title {
                  romaji
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(API_URL, {
        query,
        variables: { userName: username, type }
      }, {
        headers: {
          'Authorization': 'Bearer ' + this.token.access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const collection = response.data.data.MediaListCollection;
      if (collection && collection.lists && collection.lists.length > 0) {
        const entries = collection.lists[0].entries;
        console.log('✅ ¡Animes/Mangas obtenidos!');
        return entries.map(entry => ({ title: entry.media.title.romaji }));
      }
      return [];

    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('⚠️ El token parece inválido o ha expirado. Re-autenticando...');
        await this.authenticate();
        return this.getPlanningList(username, type); // Reintentar la llamada
      }
      console.error(`❌ Error al obtener la lista de AniList:`, error.response ? error.response.data : error.message);
      return [];
    }
  }
}

module.exports = AnilistService;