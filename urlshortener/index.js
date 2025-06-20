require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const dns = require('dns');
const mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopo>
/*
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};
*/

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// middleware to parse incoming request bodies, URL-encoded data
app.use(express.json()); //PArse json bodies for POST req
app.use(express.urlencoded({ extended: false}));

/*
//url model to store
const urlDB = mongoose.model('URL', {
    original: {type: String},
    short: {type: String}
});
*/
 //first create a function that check if URL is valid using  validUrl
 function isValidUrl(url) {
  if (!validUrl.isUri(url)) { //check URL is correct on syntax
    return res.json({ error: 'invalid url' });
  }
  //extract info domain from  URL
  const urlParts = new URL(url); //make url variable that has been checked a URL object
  const domain = urlParts.hostname; //get the hostname from URL object

  return new Promise((resolve, reject) => {
    // use DNS to check if domaine can be reached
    dns.lookup(domain, (err, addresses) => {
      if (err) {
        reject(false);  //domain not reacheble
      } else {
        resolve(true); //domain  exist and can be reached
      }
     });
  });
}
// shorteneing URL
const shortenURL =  async {
  
}
// POST endpoint to make URL shorter
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;

  try { //asynch to get catch error
    const validMuch = await isValidUrl(url);

    if (!validMuch) {
      return res.json({ error: "Invalid URL" }); //if not valid give error message
    }
    //short url generator
    const shortUrl = ;
    //store URL mapping in DB, only memory, not mongoDB, don't need to make it more complex
    var new_url =new urlDB({
        original: url,
        short: shortUrl
     });
     res.json({ original_url: url, short_url: shortUrl }); //give answer with original and short url
  } catch (err) {
    res.json({ error: 'Error in checking URL syntax' });
    }
});

// Redirect
app.get('/api/shorturl/:shortd', (req, res) => {
  const { shortd } = req.params; 
  var findUrl = urlDB.findOne({short: shortd}).select({short:0})
     .then((short) => {
       console.log(short);
     })
     .catch((err) => {
     console.log(err);
     });


/*
  if (findUrl) {  //check if urlDB has been populated
    return res.redirect(findUrl); //if yes, return the value
  } else {
  return res.json({ error: 'Short URL not found'  });
  } */
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
