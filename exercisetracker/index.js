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
    const user = await User.findById(userId);
    //console.log(user);
    if (!user) {
       return res.json({ error: 'User not found' });
    }
    const exSave = await Excer.create({
      userId: user._id, 
      description, //: description,
      duration: parseInt(duration),
      date: date
    });
     console.log({
      //was put same as shown on excercice page but didnt wokred.... 
      //so put id username, descr, duration, date...
      _id: user._id,
      username: user.username,
      description: exSave.description,
      duration: exSave.duration,
      date: exSave.date.toDateString()
    })
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
  const { from, to, limit } = req.query; //get filter from query
  try{
    const user = await User.find({userId}); //can't use byId, not same id btw User and Excer
    if (!user) return res.json({ error: 'User not found' });
    //build a filter if present
    const filt = { userId };
    if ( from || to) { // if from or to is present then
      filt.date = {}; //start date propriété in filter
      if (from) filt.date.$gte = new Date(from); //greater than from date
      if (to) filt.date.$lte = new Date(to); //less than to date
    }
    let spec = Excer.find(filt); //create a query name spec with the filter
    if (limit)  { //if limit is present then
      spec = spec.limit(parseInt(limit));  // we limit mongoose query by limit
      // by using limit paramter
    }
   const excerc = await spec.exec(); // execute query built in mongoose and return fully resolved (regarding promises) result
   const log = excerc.map(ex => ({ //map the query result to have the proper aspect
     description: ex.description,
     duration: ex.duration, //alreadyy number
     date: ex.date.toDateString()//to have a string
   }));
    return res.json({
      username: user.username,
      count: log.length, //instead of using an other countDocuments, use lenght
     //of map will be faster
      _id: user._id,
      log: log
    });
  } catch(err) {
    console.error(err);
    res.json({ error: 'Failed to retrieve logs' });
  }
});


   /*  const exercice = await Excer.findById(userId);
    //count by finding using countDocuments
    const count = await Excer.countDocuments({ userId }); */
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
