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

//api to get all user in db
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
// api to register excerice in db
app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id; // because the path isn't same as previous _id is a params
  const { description, duration } = req.body;
  let date = req.body.date; // use let otherwise cant change it later
  //can use callback but not familiar enough with it....
  if (!date) {
    date = new Date();
  }
  //console.log(date);
  try{ //check firs if user is available in db otherwise throw error
    const user = User.findById(userId);
    //console.log(user);
    if (!user) {
       return res.json({ error: 'User not found' });
    }
    const exSave = await Excer.create({
      userId: user._id, 
      description: description,
      duration: parseInt(duration),
      date: date
    });
    //console.log(exSave);
    res.json({
      //was put same as shown on excercice page but didnt wokred.... 
      //so put id username, descr, duration, date...
      _id: user._id,
      username: user.username,
      description: exSave.description,
      duration: exSave.duration,
      date: exSave.date.toDateString()
    });
  } catch (err) {
    console.log({ error: 'Failed to add excercise' });
  }
});

// api to get full excercice log of any user
app.get('/api/users/:_id/logs', async (req,res) => {
  const userId = req.params._id;
  
  try{
    //count by finding using countDocuments
    const exercice = Excer.findById(userId);
    const user= User.findById(userId);
    const count = Excer.findById(userId).countDocuments();
    return res.json({
      username: user.username,
      count: count,
      _id: excercice._id,
      log: exercice
    });
  } catch(err) {
    console.log({ error: 'Failed to retrieve logs' });
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
