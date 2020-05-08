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
// the pokemon with 71 moves and the abilities "hustle", "rivalry", "poison-point"
//Solution is 30 ! 
//fetchPoke('https://pokeapi.co/api/v2/pokemon/30/');
// the pokemon with 71 moves and the abilities "hustle", "rivalry", "poison-point"
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

      //exit if ability id less than 3 -- early return
      assert.strictEqual(data.abilities.length > 2, true);

      //check for the name of abilities 
      let one_found = false;
      let two_found = false;
      let three_found = false;
      for (var i = 0; i < data.abilities.length; i++) {
        for (var prop in data.abilities[i]) {
          if (data.abilities[i].hasOwnProperty(prop)) {
            if (data.abilities[i][prop].name !== undefined) {

              console.log(data.abilities[i][prop].name);
              if (data.abilities[i][prop].name === "hustle") {
                console.log(data.abilities[i][prop].name);
                one_found = true;
              }
              else if (data.abilities[i][prop].name === "rivalry") {
                console.log(data.abilities[i][prop].name);
                two_found = true;

              }
              else if (data.abilities[i][prop].name === "poison-point") {
                console.log(data.abilities[i][prop].name);
                three_found = true;
              }
            }
          }
        }
      }
      console.log(one_found, three_found, two_found);
      assert.strictEqual(one_found, true);
      assert.strictEqual(two_found, true);
      assert.strictEqual(three_found, true);
      //check length of the moves 
      assert.strictEqual(data.moves.length, 71);


      console.log('The Id for this solution is ' + data.id);
      log('The Id for this solution is  ' + data.id);
      log('... PASS!');
      process.exit(0)
    })
    .catch(err => log(err.stack));

}
//Solution is 30 ! 
//fetchPoke('https://pokeapi.co/api/v2/pokemon/30/');


async function search(data) {
  console.log(data.results);

  await data.results.forEach(element => {
    fetchPoke(element.url);
  });

}

async function searchTillFound(offst, limit) {
  const res = await nodeFetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offst}&limit=${limit}`);
  let data = await res.json();
  while (search(data)) {
    const resInLoop = await nodeFetch(data.next);
    data = await resInLoop.json();
  }
}
const dotDotDot = setInterval(() => log('...'), 100);
searchTillFound(0, 10);








