require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const dns = require('dns');
const mongoose = require('mongoose');

//mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopo>
// connect to mongodb
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected");
    } catch (error) {
      console.error("MongoDB connection error:", error.message);
      process.exit(1);
    }
};
connectDB();

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


//url model to store
const urlSchema = mongoose.Schema; 
let UrlTemplate = new mongoose.Schema({
    original: { type: String, required: true },
    short: { type: String, required: true }});

//create  mongoose schema to register original and shrt URL
let Url = mongoose.model('Url', UrlTemplate);

//first create a function that check if URL is valid using  validUrl
function isValidUrl(url) {
  if (!validUrl.isUri(url)) { //check URL is correct on syntax
    return Promise.reject({ error: 'invalid url' }); //return a reject promise if it failed
  }
  //extract info domain from  URL
  const urlParts = new URL(url); //convert URL to object to extract hostname
  const domain = urlParts.hostname; //get the hostname from URL object

  return new Promise((resolve, reject) => {
    // use DNS to check if domaine can be reached
    dns.lookup(domain, (err) => {
      if (err) {
        reject("Domain not reached");  //domain not reacheble
      } else {
        resolve(true); //domain  exist and can be reached
      }
     });
  });
}
// shorteneing URL
const genShortURL = () => {
  const length = 6; //length of generated short url
  const characs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcedfghijklmnopqrstuvwxyz0123456789';
  let  result = '';
  for (let i = 0; i < length; i++) {
     result += characs.charAt(Math.floor(Math.random() * characs.length));
  }
  console.log({res_gen: result});
  return result;
}
// POST endpoint to make URL shorter
app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  console.log("Recevei URL", url );
  try { //asynch to get catch error
    const validMuch = await isValidUrl(url);
    console.log("URL valid?", validmuch);
    if (!validMuch) {
      console.log({valid_url: validMuch});
      return res.json({ error: "Invalid URL" }); //if not valid give error message
    }
    //checking if URL already exists in DB
    const existUrl = await URL.findOne({ original: url });
    if (existUrl) {
      console.log("URL Exist?", existUrl);
      return res.json({ original_url: url, short_url: existUrl.short });
    }

    //short url generator
    const shortUrl = genShortUrl();
    console.log("Generated shortr URL", shortUrl);

    //store URL in mongDb, tried memory but didnt worked
    const newUrl = new URL({ original: url, short: shortUrl }); //create new entry
    await newUrl.save(); //save it to db
    res.json({ original_url: url, short_url: shortUrl }); //give answer with original and short url
  } catch (err) {
    console.log("Error", err);
    res.json({ error: 'Error in checking URL syntax' });
    }
});

// Redirect
app.get('/api/shorturl/:short', async (req, res) => {
  const short = req.params.short; 
  console.log({ check_short_exist: short });
  try {
   //find original URL from DB
   const url = await URL.findOne({ short })
   if (!url) {
     return res.json({ error: 'Short URL not found' });
   }
  //redirect to original URL
  res.redirect(url.original);
  } catch (err) {
     res.json({ error: 'Error while fetching URL from database'});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});



/*
     .then((short) => {
       console.log(short);
     })
     .catch((err) => {
     console.log(err);
     });


  if (findUrl) {  //check if urlDB has been populated
    return res.redirect(findUrl); //if yes, return the value
  } else {
  return res.json({ error: 'Short URL not found'  });
  } */
