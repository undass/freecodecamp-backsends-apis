require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const dns = require('dns');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, 
{ useNewUrlParser: true, useUnifiedTopology: true });
/* used simpler versio...
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
*/
// Basic Configuration
const port = process.env.PORT || 3000;

//url model to store
const urlSchema = new mongoose.Schema({
    original_url: String , // , required: true },
    short_url: Number }); //, required: true }});

//create  mongoose schema to register original and shrt URL
const Url = mongoose.model('Url', urlSchema);

// middleware to parse incoming request bodies, URL-encoded data
app.use(express.json()); //PArse json bodies for POST req
app.use(express.urlencoded({ extended: false}));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

/*
// shorteneing URL wont be used..... too complexed and didnt succeded in  make it worked
const genShortUrl = () => {
  const length = 6; //length of generated short url
  const characs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcedfghijklmnopqrstuvwxyz0123456789';
  let  result = '';
  for (let i = 0; i < length; i++) {
     result += characs.charAt(Math.floor(Math.random() * characs.length));
  }
  console.log({res_gen: result});
  return result;
} */
/* didnt worke.... try to use simpler version all in POST
//first create a function that check if URL is valid using  validUrl
function isValidUrl(url) {
  if (!validUrl.isWebUri(url)) { //check URL is correct on syntax
    return Promise.reject({ error: 'invalid url' }); //return a reject promise if it failed
  }
  return Promise.resolve(true);
*/
// POST endpoint to make URL shorter
app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  console.log("Recevei URL", url );
  try { //asynch to get catch error
    const validMuch = new URL(url);
    console.log("URL valid?", validMuch);
    //tried to use other function just reverted back to cehcking if there http and https: 
    if (validURL.protocol !== 'http' && validUrl.protocol !== 'https:') {
      console.log({valid_url: validMuch});
      return res.json({ error: "invalid URL" }); //if not valid give error message
    }

  } catch (err) {
    return res.json({ error: 'invalid url' }); //if it as error its alos an invalid url
  }
    //checking if URL already exists in DB
    let existUrl = await Url.findOne({ original: url });
    if (existUrl) {
      console.log("URL Exist?", existUrl);
      return res.json({ original_url: existUrl.original_url, short_url: existUrl.short_url });
    }

    //short url generator
    const count = await Url.countDocuments();
    //const shortUrl = await Url.countDocuments({}); // used a function but instead will be using a simple integer genShortUrl();
    //use simple url generator with a count of +1
    // create entry, give a log and then save into db
    const newUrl = new Url({ original_url: url, short_url: count + 1 });
    console.log("Generated shortr URL", shortUrl);
    await newUrl.save();

    res.json({ original_url: newUrl.original_url, short_url: newUrl.short_url }); //give answer with original and short url
});

// Redirect
app.get('/api/shorturl/:short', async (req, res) => {
  const short = parseInt(req.params.short); //here instead of just getting URl, we only take the interger
  console.log({ check_short_exist: short });
  const founded = await Url.findOne( { short_url: short });
  if (founded) {
    return res.redirect(founded.original_url);
  } else {
    return res.json({ error: 'No short found for input' });
  }

});
/* not fucking working...
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
*/
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
