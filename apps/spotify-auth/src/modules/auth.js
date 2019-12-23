/*
 Test                 Yes
---------> <success?> --> (done) <--------\
               |             ^ Yes        |
               v No          |            |
           [Refresh] ---> <success?>  [Callback]
                             |            |
                             v No         |
                        [Re-auth] --------/
*/

const { promisify } = require('util');
const Spotify = require('spotify-web-api-node');
const { attic, config, log } = require('../node-common')(['attic', 'config', 'log']);

config.requireKeys('auth.js', {
  required: ['SPOTIFY', 'SERVER'],
  properties: {
    SPOTIFY: {
      required: ['CLIENT_ID', 'CLIENT_SECRET', 'SERVER_IP'],
      properties: {
        CLIENT_ID: { type: 'string' },
        CLIENT_SECRET: { type: 'string' },
        SERVER_IP: { type: 'string' },
      },
    },
    SERVER: {
      required: ['PORT'],
      properties: {
        PORT: { type: 'number' },
      },
    },
  },
});

const {
  /** Spotify config */
  SPOTIFY,
  /** Server config */
  SERVER,
} = config;

/** Keys for Attic database */
const DB_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  AUTH_CODE: 'spotify_auth_code',
};

/**
 * Build a credentials object for spotify-web-api-node
 *
 * @returns {Object}
 */
const buildCredentials = () => ({
  clientId: SPOTIFY.CLIENT_ID,
  clientSecret: SPOTIFY.CLIENT_SECRET,
  redirectUri: `http://${SPOTIFY.SERVER_IP}:${SERVER.PORT}/spotifyCallback`
});

/**
 * Build the auth callback URL that will result in the user providing AUTH_CODE for safe keeping.
 *
 * @returns {string} Auth callback URL to be called by logged in Spotify user.
 */
const buildAuthURL = () => {
  const scopes = ['user-read-private', 'user-read-currently-playing', 'user-read-playback-state'];
  return new Spotify(buildCredentials()).createAuthorizeURL(scopes, 0);
};

/**
 * Refresh and store the active accessToken.
 *
 * @param {Object<Spotify>} Spotify API client.
 */
const refreshCredentials = async (spotifyApi) => {
  const refreshAccessTokenAsync = promisify(spotifyApi.refreshAccessToken).bind(spotifyApi);
  const { body } = await refreshAccessTokenAsync();
  const accessToken = body['access_token'];

  // Save the new token
  await attic.set(DB_KEYS.ACCESS_TOKEN, accessToken);
  spotifyApi.setAccessToken(accessToken);

  log.debug('Access token refreshed');
};

/**
 * Test current API credentials work. If not, try and refresh them.
 *
 * @param {Object<Spotify>} Spotify API client.
 */
const testCredentials = async (spotifyApi) => {
  const accessToken = await attic.get(DB_KEYS.ACCESS_TOKEN);
  const refreshToken = await attic.get(DB_KEYS.REFRESH_TOKEN);
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);

  log.debug('Testing credentials...');
  const getMyCurrentPlaybackStateAsync = promisify(spotifyApi.getMyCurrentPlaybackState)
    .bind(spotifyApi);

  try {
    await getMyCurrentPlaybackStateAsync('UK');
  } catch(e) {
    await refreshCredentials(spotifyApi);
  }
};

/**
 * Create and test an spotify-web-api-node API access object.
 *
 * @returns {Object<Spotify>} Spotify API object for use.
 */
const authenticate = async () => {
  const spotifyApi = new Spotify(buildCredentials());
  const accessTokenExists = await attic.exists(DB_KEYS.ACCESS_TOKEN);
  const refreshTokenExists = await attic.exists(DB_KEYS.REFRESH_TOKEN);

  if (accessTokenExists && refreshTokenExists) {
    // Use saved credentials, which may require updating
    log.debug('Using existing credentials');
    await testCredentials(spotifyApi);
    return spotifyApi;
  }

  log.debug('Granting new credentials...');
  const authCode = await attic.get(DB_KEYS.AUTH_CODE);
  const authorizationCodeGrantAsync = promisify(spotifyApi.authorizationCodeGrant).bind(spotifyApi);

  const res = await authorizationCodeGrantAsync(authCode);
  log.debug('Granted new credentials');
  await attic.set(DB_KEYS.ACCESS_TOKEN, res.body['access_token']);
  await attic.set(DB_KEYS.REFRESH_TOKEN, res.body['refresh_token']);

  // Test and return API object
  await testCredentials(spotifyApi);
  return spotifyApi;
};

/**
 * When Spotify calls us with the user's AUTH_CODE, save it in Attic.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const onCallback = async (req, res) => {
  log.debug('<< /spotifyCallback');

  const url = req.originalUrl;
  const authCode = url.substring(url.indexOf('?code=') + '?code='.length, url.indexOf('&state='));
  await attic.set(DB_KEYS.AUTH_CODE, authCode);

  res.status(200);
  res.set('Content-Type', 'text/html');
  res.send(authCode);
};

module.exports = {
  authenticate,
  buildAuthURL,
  onCallback,
};
