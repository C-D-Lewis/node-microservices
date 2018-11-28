/*
 Request              Yes
---------> <success?>  > (done) < .......
               v No         ^ Yes       .
           [Refresh]  > <success?>  [Callback]
                            v No        .
                        [Re-auth] .......
*/

const { promisify } = require('util');

const Spotify = require('spotify-web-api-node');

const {
  attic, config, conduit, log
} = require('@chris-lewis/node-common')(['attic', 'config', 'conduit', 'log']);

config.requireKeys('auth.js', {
  required: [ 'SPOTIFY', 'SERVER' ],
  type: 'object', properties: {
    SPOTIFY: {
      required: [ 'CLIENT_ID', 'CLIENT_SECRET', 'SERVER_IP' ],
      type: 'object', properties: {
        CLIENT_ID: { type: 'string' },
        CLIENT_SECRET: { type: 'string' },
        SERVER_IP: { type: 'string' }
      }
    },
    SERVER: {
      required: [ 'PORT' ],
      type: 'object', properties: {
        PORT: { type: 'number' }
      }
    }
  }
});

const DB_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  AUTH_CODE: 'spotify_auth_code',
};

const buildCredentials = () => ({
  clientId: config.SPOTIFY.CLIENT_ID,
  clientSecret: config.SPOTIFY.CLIENT_SECRET,
  redirectUri: `http://${config.SPOTIFY.SERVER_IP}:${config.SERVER.PORT}/callback`
});

const buildAuthURL = () => {
  const permissions = ['user-read-private', 'user-read-currently-playing', 'user-read-playback-state'];
  return new Spotify(buildCredentials()).createAuthorizeURL(permissions, 0);
};

const refreshCredentials = async (spotifyApi) => {
  const refreshAccessToken = promisify(spotifyApi.refreshAccessToken).bind(spotifyApi);
  const response = await refreshAccessToken();
  const accessToken = response.body['access_token'];

  await attic.set(DB_KEYS.ACCESS_TOKEN, accessToken);
  spotifyApi.setAccessToken(accessToken);

  log.debug('Access token refreshed');
  return spotifyApi;
};

const testCredentials = async (spotifyApi) => {
  const accessToken = await attic.get(DB_KEYS.ACCESS_TOKEN);
  const refreshToken = await attic.get(DB_KEYS.REFRESH_TOKEN);
  spotifyApi.setAccessToken(accessToken);
  spotifyApi.setRefreshToken(refreshToken);

  log.debug('Testing credentials...');
  const getMyCurrentPlaybackState = promisify(spotifyApi.getMyCurrentPlaybackState).bind(spotifyApi);

  try {
    await getMyCurrentPlaybackState('UK');
    return spotifyApi;
  } catch(e) {
    return refreshCredentials(spotifyApi);
  }
};

const authenticate = async () => {
  const spotifyApi = new Spotify(buildCredentials());
  log.debug(spotifyApi);
  const accessTokenExists = await attic.exists(DB_KEYS.ACCESS_TOKEN);
  log.debug('accessTokenExists', accessTokenExists);
  const refreshTokenExists = await attic.exists(DB_KEYS.REFRESH_TOKEN);
  log.debug('refreshTokenExists', refreshTokenExists);

  if(accessTokenExists && refreshTokenExists) {
    log.debug('Using existing credentials');
    return testCredentials(spotifyApi);
  }

  log.debug('Granting new credentials...');
  const authCode = await attic.get(DB_KEYS.AUTH_CODE);
  const authorizationCodeGrant = promisify(spotifyApi.authorizationCodeGrant).bind(spotifyApi);

  const response = await authorizationCodeGrant(authCode);
  log.debug('Granted new credentials');
  await attic.set(DB_KEYS.ACCESS_TOKEN, response.body['access_token']);
  await attic.set(DB_KEYS.REFRESH_TOKEN, response.body['refresh_token']);
  return testCredentials(spotifyApi);
};

const onCallback = async (req, res) => {
  log.debug('<< /callback');

  const url = req.originalUrl;
  const authCode = url.substring(url.indexOf('?code=') + '?code='.length, url.indexOf('&state='));
  await attic.set(DB_KEYS.AUTH_CODE, authCode);

  res.status(200);
  res.header('Content-Type', 'text/html');
  res.send(authCode);
};

module.exports = { authenticate, buildAuthURL, onCallback };
