/*
 Test                 Yes
---------> <success?> --> (done)
               |             ^ Yes
               v No          |
           [Refresh] ---> <success?>
                             |
                             v No
                        [Re-auth]
*/

const { promisify } = require('util');
const Spotify = require('spotify-web-api-node');
const {
  attic, conduit, config, log,
} = require('../node-common')(['attic', 'conduit', 'config', 'log']);

config.requireKeys('spotifyAuth.js', {
  required: ['SPOTIFY', 'AUTH_ATTIC'],
  properties: {
    SPOTIFY: {
      required: ['CLIENT_ID', 'CLIENT_SECRET', 'CONCIERGE_IP', 'CONCIERGE_PORT'],
      properties: {
        CLIENT_ID: { type: 'string' },
        CLIENT_SECRET: { type: 'string' },
        CONCIERGE_IP: { type: 'string' },
        CONCIERGE_PORT: { type: 'number' },
      },
    },
    AUTH_ATTIC: {
      required: ['HOST', 'KEY'],
      properties: {
        HOST: { type: 'string' },
        KEY: { type: 'string' },
      },
    },
  },
});

const {
  /** Spotify config */
  SPOTIFY,
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
  redirectUri: `http://${SPOTIFY.CONCIERGE_IP}:${SPOTIFY.CONCIERGE_PORT}/spotifyCallback`,
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
 * Fetch any authorization code deposited in remote attic by the logged in user
 * visiting the auth URL and being redirected to concierge.
 *
 * Should be done if authorization fails.
 */
const updateRemoteAuthCode = async () => {
  // Fetch credentials
  const res = await conduit.send({
    to: 'attic',
    topic: 'get',
    host: config.AUTH_ATTIC.HOST,
    message: { app: 'concierge', key: config.AUTH_ATTIC.KEY },
  });
  if (!res || !res.message) {
    // Nothing was found
    log.error(`No code is stored yet or was not found: ${JSON.stringify(res)}`);
    throw new Error('No code is stored yet');
  }

  const { code } = res.message.value;
  if (!code) {
    throw new Error(`/spotifyCallback did not contain .code: ${JSON.stringify(res)}`);
  }

  // Set credential in Attic locally
  await attic.set(DB_KEYS.AUTH_CODE, code);
  log.debug(`Saved new AUTH_CODE: ${code}`);
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
 * If returns null, caller should return buildAuthURL() to end user.
 *
 * @returns {Object<Spotify>} Spotify API object for use.
 */
const createSpotifyClient = async () => {
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
  await updateRemoteAuthCode();
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

module.exports = {
  createSpotifyClient,
  buildAuthURL,
};
