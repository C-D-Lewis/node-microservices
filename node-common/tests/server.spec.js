const { expect } = require('chai');
const config = require('../src/modules/config');
const requestAsync = require('../src/modules/requestAsync');
const server = require('../src/modules/server');

describe('server.js', () => {
  let app;

  it('should start a server', async () => {
    await server.start();
  });

  it('should expose the Express app', () => {
    app = server.getExpressApp();

    expect(app).to.be.a('function');
  });

  it('should allow new routes and respond OK', async () => {
    app.get('/ok', (req, res) => {
      server.respondOk(res);
    });

    const { body } = await requestAsync(`http://localhost:${config.SERVER.PORT}/ok`);
    expect(body).to.equal('OK\n');
  });

  it('should handle /status', async () => {
    const { body } = await requestAsync(`http://localhost:${config.SERVER.PORT}/status`);
    expect(body).to.equal('OK\n');
  });

  it('should handle /pid', async () => {
    const { body } = await requestAsync(`http://localhost:${config.SERVER.PORT}/pid`);
    const json = JSON.parse(body);

    expect(json.pid).to.be.a('number');
  });

  it('should respond Bad Request', async () => {
    app.get('/br', (req, res) => {
      server.respondBadRequest(res);
    });

    const { body } = await requestAsync(`http://localhost:${config.SERVER.PORT}/br`);
    expect(body).to.equal('Bad Request\n');
  });

  it('should respond Not Found', async () => {
    app.get('/nf', (req, res) => {
      server.respondNotFound(res);
    });

    const { body } = await requestAsync(`http://localhost:${config.SERVER.PORT}/nf`);
    expect(body).to.equal('Not Found\n');
  });

  it('should stop the server', () => {
    expect(() => server.stop()).to.not.throw();
  });
});
