// index.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();
var bodyparser = require('body-parser');

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/:whoami', function (req, res) {
  //const who = req.params;
  let ip = req.ip;
 // const myhead = new Headers();
 // let rekest = new Headers(req.params);
 // let langg = rekest["accept-language"];
  let lang = req.headers['accept-language'];
  let soft = req.headers['user-agent'];
  //console.log({IPs: ip, languages: langg, software: soft});
  res.json({ipaddress: ip , language: lang , software: soft });
});

 // host: 'localhost:3000',
   // 'user-agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0',
   // accept: '',
//    'accept-language': 'en-US,en;q=0.5',
  //  'accept-encoding': 'gzip, deflate, br, zstd',
   // origin: 'null',
   // connection: 'keep-alive',
   // 'sec-fetch-dest': 'empty',
   // 'sec-fetch-mode': 'cors',
   // 'sec-fetch-site': 'cross-site'
 // },

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
