require('express-async-errors');
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const app = express();

// MONGODBStore
const MongoDBStore = require('connect-mongodb-session')(session);
const url = process.env.MONGO_URI;
const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: 'mySessions',
});
store.on('error', function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: 'strict' },
};
app.use(session(sessionParms));

// extra security packages
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

// extra security packages
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 100, //limit each IP to 100 request per windowMs
  })
);
app.use(express.json());
app.use(helmet());
app.use(xss());

if (app.get('env') === 'production') {
  // app.set('trust proxy', 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

// passport verification
const passport = require('passport');
const passportInit = require('./passport/passportInit');

passportInit();
app.use(passport.initialize());
app.use(passport.session());

const cookieParser = require('cookie-parser');
app.use(cookieParser(process.env.SESSION_SECRET));

app.set('view engine', 'ejs');
app.use(require('body-parser').urlencoded({ extended: true }));

const csrf = require('host-csrf');
let csrf_development_mode = true;
if (app.get('env') === 'production') {
  csrf_development_mode = false;
  app.set('trust proxy', 1);
}
const csrf_options = {
  protected_operations: ['PATCH'],
  protected_content_types: ['application/json'],
  development_mode: csrf_development_mode,
};

app.use(csrf(csrf_options));
app.use(require('connect-flash')());
app.use(require('./middleware/storeLocals'));

// index routes
app.get('/', (req, res) => {
  res.render('index');
});
app.use('/sessions', require('./routes/sessionRoutes'));

// secret word routes
const secretWordRouter = require('./routes/secretWord');
const auth = require('./middleware/auth');
app.use('/secretWord', auth, secretWordRouter);

// jobs routes
app.use('/jobs', auth, require('./routes/jobs'));

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require('./db/connect')(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
