require('./config/config');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet')
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const fileUpload = require('express-fileupload');
const cors = require('cors');
             require('isomorphic-fetch');

const searchRoutes = require('./routes/search');
const usersRoutes = require('./routes/users');
const socialAuthRoutes = require('./routes/socialAuth');
const connectRoutes = require('./routes/connect');

const auth = require('./passport/auth.js');
const githubAuth = require('./passport/strategies/githubAuth.js');
const googleAuth = require('./passport/strategies/googleAuth.js');
const facebookAuth = require('./passport/strategies/facebookAuth.js');

const app = express();
app.use(cors());
app.use(helmet());
app.use(fileUpload());

console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI);

app.use(session({
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.json())

auth(app);
githubAuth();
facebookAuth();
googleAuth();

app.use('/search', searchRoutes);
app.use('/users', usersRoutes);
app.use('/socialAuth', socialAuthRoutes);

const port = process.env.PORT || 8081;
app.listen(port);

module.exports = app;
