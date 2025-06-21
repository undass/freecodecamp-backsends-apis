const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); //define configuration option of multer

//middleware
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json()); //body-parser included express middleware to parse every request
app.use(express.urlencoded({ extended: true })); // to dec rypt encoded

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//appi post with proper path taken from index.html and proper name attribute of multer
//instead upload.single("name") we do upload.single("upfile")
//only 1 file asked, no need for upload.array()
app.post('/api/fileanalyse', upload.single("upfile"), (req,res) => {
    let name = req.file.originalname;
    let type = req.file.mimetype;
    let size =  req.file.size;
    console.log(name, type, size); // could put everythin into a array.
    res.json({ name: name, type: type, size: size });
});
  //const upfile = req.
//app.post( upload.array("files"), uploadFiles);


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
