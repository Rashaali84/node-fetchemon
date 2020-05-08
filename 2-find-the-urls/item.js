// require dependencies
const fs = require('fs');
const path = require('path');
const nodeFetch = require('node-fetch');
const assert = require('assert');

// declare constants
const START = Date.now();
const REPORT_FILE = __dirname + '/' + path.basename(__filename).replace('.js', '-report.txt');

// define logging function
const log = (msg) => {
  const now = `${Date.now() - START} ms: `;
  console.log(now + msg);
  if (typeof msg === 'string') {
    const cleanedString = msg
      // remove special characters used to print assertion colors in terminal
      .replace(/\[31m|\[32m|\[39m/g, '')
      // remove the file path from error messages for privacy and readability
      .replace(new RegExp(__dirname, "g"), ' [ ... ] ');
    fs.appendFileSync(REPORT_FILE, now + cleanedString + '\n');
  } else {
    const stringifiedMsg = JSON.stringify(msg);
    fs.appendFileSync(REPORT_FILE, now + stringifiedMsg + '\n');
  };
};

// log when a user forces the script to exit
process.on('SIGINT', function onSIGINT() {
  log('Ctrl-C');
  process.exit(2);
});

// log uncaught errors
const handleError = (err) => {
  log(err);
  process.exit(1);
};
process.on('uncaughtException', handleError);
process.on('unhandledRejection', handleError);

// (re)initialize report file
fs.writeFileSync(REPORT_FILE, '');
log((new Date()).toLocaleString());


// --- begin main script ---
//solution https://pokeapi.co/api/v2/item/23/

async function main(URL) {
  try {
    console.log(URL);
    log('fetching ' + URL + ' ...');
    const dotDotDot = setInterval(() => log('...'), 100);
    const res = await nodeFetch(URL);
    clearInterval(dotDotDot);

    log('testing response ...');
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.status, 200);

    log('parsing response ...');
    const data = await res.json();
    console.log(data);

    log('testing data ...');
    assert.strictEqual(data.cost, 3000);
    assert.strictEqual(data.fling_power, 30);
    assert.strictEqual(data.fling_effect, null);
    assert.strictEqual(data.baby_trigger_for, null);
    console.log('Id of the item is :' + data.id);
    log('... PASS!');
    process.exit(0);

  } catch (err) {
    //log(err.stack);
    return err;
  };
};

async function search(data) {
  console.log(data.results);
  await data.results.forEach(element => {
    main(element.url);
  });

}

async function searchTillFound(offst, limit) {
  const res = await nodeFetch(`https://pokeapi.co/api/v2/item/?offset=${offst}&limit=${limit}`);
  let data = await res.json();
  while (search(data)) {
    const resInLoop = await nodeFetch(data.next);
    data = await resInLoop.json();
  }
}
searchTillFound(0, 10);

//solution https://pokeapi.co/api/v2/item/23/