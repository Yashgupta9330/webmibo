const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const db = require('./config/database');
const { signup, login, profile } = require('./controller/auth');
const { auth } = require('./middleware/auth');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Connect to the MySQL database
db.connect((err) =>{
  if (err) {
    console.error('Errorconnecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + db.threadId);
});


app.post('/signup',signup)
app.post('/login',login)
app.get('/profile',auth,profile);
app.get('/', (req, res) => {
  return res.json({ hello: "world" });
});


app.listen(process.env.PORT, () => {
    console.log('Server is running on port 4000');
});
