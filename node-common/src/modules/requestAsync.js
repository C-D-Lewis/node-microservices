const request = require('request');

module.exports = opts => new Promise((resolve, reject) => {
  request(opts, (err, response, body) => {
    if(err) {
      reject(err);
      return;
    }

    resolve({ response, body });
  });
});
