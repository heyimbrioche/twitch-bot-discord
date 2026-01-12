import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.js';

class OAuthService {
  constructor(clientId, clientSecret, redirectUri, port = 3000) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.port = port;
    this.app = express();
    this.pendingAuths = new Map(); // Map pour stocker les codes d'authentification en attente
    this.server = null;
  }

  generateState() {
    return crypto.randomBytes(32).toString('hex');
  }

  getAuthUrl(state) {
    const scopes = 'user:read:email channel:read:stream_key';
    return `https://id.twitch.tv/oauth2/authorize?` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `state=${state}`;
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: this.redirectUri,
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type,
        scope: response.data.scope,
      };
    } catch (error) {
      logger.error('Erreur lors de l\'échange du code OAuth:', error);
      throw error;
    }
  }

  async getUserInfo(accessToken) {
    try {
      const response = await axios.get('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-ID': this.clientId,
        },
      });

      if (response.data.data.length === 0) {
        throw new Error('Aucune information utilisateur trouvée');
      }

      return response.data.data[0];
    } catch (error) {
      logger.error('Erreur lors de la récupération des infos utilisateur:', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      logger.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }

  startServer() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Route de callback OAuth
    this.app.get('/oauth/callback', async (req, res) => {
      const { code, state, error } = req.query;

      if (error) {
        res.send(`
          <html>
            <head><title>Erreur d'authentification</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: #ff0000;">❌ Erreur d'authentification</h1>
              <p>${error}</p>
              <p>Vous pouvez fermer cette fenêtre.</p>
            </body>
          </html>
        `);
        return;
      }

      if (!code || !state) {
        res.send(`
          <html>
            <head><title>Erreur</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: #ff0000;">❌ Code ou state manquant</h1>
              <p>Vous pouvez fermer cette fenêtre et réessayer.</p>
            </body>
          </html>
        `);
        return;
      }

      const authData = this.pendingAuths.get(state);
      if (!authData) {
        res.send(`
          <html>
            <head><title>Erreur</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: #ff0000;">❌ State invalide ou expiré</h1>
              <p>Vous pouvez fermer cette fenêtre et réessayer.</p>
            </body>
          </html>
        `);
        return;
      }

      try {
        // Échanger le code contre un token
        const tokenData = await this.exchangeCodeForToken(code);
        
        // Récupérer les infos utilisateur
        const userInfo = await this.getUserInfo(tokenData.accessToken);

        // Calculer la date d'expiration
        const expiresAt = Date.now() + (tokenData.expiresIn * 1000);

        // Résoudre la promesse avec les données
        authData.resolve({
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          expiresAt: expiresAt,
          userInfo: userInfo,
        });

        // Nettoyer
        this.pendingAuths.delete(state);

        res.send(`
          <html>
            <head><title>Authentification réussie!</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px; background: #9146FF; color: white;">
              <h1>✅ Authentification réussie!</h1>
              <p>Bienvenue <strong>${userInfo.display_name}</strong>!</p>
              <p>Vous pouvez maintenant fermer cette fenêtre et retourner sur Discord.</p>
              <p style="margin-top: 30px; font-size: 12px; opacity: 0.8;">Le bot va maintenant surveiller votre chaîne Twitch.</p>
            </body>
          </html>
        `);
      } catch (error) {
        authData.reject(error);
        this.pendingAuths.delete(state);

        res.send(`
          <html>
            <head><title>Erreur</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: #ff0000;">❌ Erreur lors de l'authentification</h1>
              <p>${error.message}</p>
              <p>Vous pouvez fermer cette fenêtre et réessayer.</p>
            </body>
          </html>
        `);
      }
    });

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err) => {
        if (err) {
          reject(err);
        } else {
          logger.info(`Serveur OAuth démarré sur le port ${this.port}`);
          resolve();
        }
      });
    });
  }

  stopServer() {
    if (this.server) {
      this.server.close();
      logger.info('Serveur OAuth arrêté');
    }
  }

  async initiateAuth(guildId, userId) {
    const state = this.generateState();
    const authUrl = this.getAuthUrl(state);

    // Créer une promesse pour cette authentification
    const authPromise = new Promise((resolve, reject) => {
      this.pendingAuths.set(state, {
        guildId,
        userId,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      // Nettoyer après 10 minutes
      setTimeout(() => {
        if (this.pendingAuths.has(state)) {
          this.pendingAuths.delete(state);
          reject(new Error('Authentification expirée'));
        }
      }, 10 * 60 * 1000);
    });

    return { authUrl, authPromise };
  }
}

export default OAuthService;
