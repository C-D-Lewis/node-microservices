const request = require('request');

const results = {
  passed: 0,
  failed: 0,
  total: 0
};

const testBed = {};

// ----------------------------- Test Bed Functions ----------------------------

testBed.assert = (condition, label) => {
  results.total++;
  if(condition) {
    console.log(`PASS: ${label}`);
    results.passed++;
    return;
  }

  console.log(`FAIL: ${label}`);
  results.failed++;
};

testBed.doesNotThrow = (func, label) => {
  try {
    func();
    testBed.assert(true, label);
  } catch(e) {
    console.log(e);
    testBed.assert(false, label);
  }
};

testBed.sendConduitPacket = async json => new Promise((resolve, reject) => {
  const url = 'http://localhost:5959/conduit';
  request.post({ url, json }, (err, response, body) => {
    if(err) {
      reject(err);
      return;
    }

    resolve(body);
  });
});

testBed.sleep = async ms => new Promise(resolve => setTimeout(resolve, ms));

// ----------------------------- Utility Functions -----------------------------

testBed.testConduitStatus = async (to) => {
  const response = await testBed.sendConduitPacket({ to, topic: 'status' });

  testBed.assert(response.status === 200 && response.message.content === 'OK',
    'status: response contains status:200 and content:OK');
};

testBed.requestPromise = require('./requestAsync');

testBed.expectRequestCode = async (options, code) => {
  const data = await testBed.requestPromise(options);

  testBed.assert(data.response.statusCode === code, 
    `expectRequestCode: ${options.url} to return ${code}`);
}

// Could be useful one day
// testBed.expectBody = (options, spec, done) => {
//   request(options, (err, response, body) => {
//     if(err) {
//       testBed.assert(false, err.message);
//       return done();
//     }
//     if(typeof body === 'string') body = JSON.parse(body);

//     testBed.assert(compare('expectBody', 'root', spec, body, false), 
//       `expectBody: ${options.url} to return ${JSON.stringify(spec)}`);
//     done();
//   });
// }

testBed.run = async (testAsyncFunc) => {
  await testAsyncFunc(testBed);  // async function awaiting the app tests
    
  console.log(`Tests complete: ${results.passed} passed, ${results.failed} failed\n`); 
  process.exit(results.failed);
}

module.exports = testBed;
