const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

//middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//create schema for user
const userSchema = new mongoose.Schema({
  username: String //,_id: String
});
const User = mongoose.model('User', userSchema)

// create schema for Excercice
const exSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   description: String,
   duration: Number,
   date: Date
});
const Excer = mongoose.model('Excer', exSchema);

//API to receive post form username
app.post('/api/users', async (req, res) => {
  const username = req.body.username; //req.heaer is for authorization content-type and user agent
  try {
    const user = await User.create({ username }); //create entry in db
    //console.log({ username: user.username, _id: user.id });
    res.json({ username: user.username, _id: user.id });
  } catch (err) {
    res.json({ error: 'Error user Creation' }); //shoudl use res.statsu().json() but not sure if usefull
  }
});

app.get('/api/users', async (req, res) => {
  try{
      // query without paramaters will get everything, by then specifiyng field/column we can show how it will outpout each entry
      const alluser= await User.find({}, 'username _id');
      //console.log(alluser);
      res.json(alluser);
  } catch (err) {
      res.json({ error: 'Error finding users'});
  }
});

app.post('/api/users/:_id/excercices', async (req, res) => {
  const descr = req.body.description;
  const durat = req.body.duration;
  const date = req.body.date;
  if (!date) {
    date = new Date();
  }
  const username = req.body.username;
  const user_id = User.findOne({username}, function(err, docs) {
      if (err) {
          console.log("User not found in DB",err);
      } else {
         console.log("User found",docs);
      }
  });
  try{
  const exSave = await Excer.create({ userId: username.id , description: descr, duration: durat, date: date});
  res.json({ username: exSave.username, description: exSave.description , duration: exSave.duration , date: exSave.date , _id: exSave.id });
  } catch (err) {
  console.log("Excercice can't be saved",err);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
