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

// the pokemon who's previous evolution is "Meowth"
//const URL = 'https://pokeapi.co/api/v2/pokemon-species/53';

function fetchPoke(URL) {
  log('fetching ' + URL + ' ...');
  nodeFetch(URL)
    .then(res => {
      clearInterval(dotDotDot);

      log('testing response ...');
      assert.strictEqual(res.ok, true);
      assert.strictEqual(res.status, 200);

      log('parsing response ...');
      return res.json()
    })
    .then(data => {
      log('testing data ...');

      //the pokemon who's previous evolution is "Meowth"
      assert.equal(data.evolves_from_species.name, "meowth");
      console.log('The Id for this solution is ' + data.id);
      log('The Id for this solution is ' + data.id);
      log('... PASS!');
      process.exit(0)
    })
    .catch(err => log(err.stack));

}
async function search(data) {
  //console.log(data.results);

  await data.results.forEach(element => {
    fetchPoke(element.url);
  });

}

async function searchTillFound(offst, limit) {
  const res = await nodeFetch(`https://pokeapi.co/api/v2/pokemon-species/?offset=${offst}&limit=${limit}`);
  let data = await res.json();
  while (search(data)) {
    const resInLoop = await nodeFetch(data.next);
    data = await resInLoop.json();
  }
}
const dotDotDot = setInterval(() => log('...'), 100);
searchTillFound(0, 10);


//doesn't exist 