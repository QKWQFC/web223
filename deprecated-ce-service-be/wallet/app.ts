require('dotenv').config();

var createError = require('http-errors');
import express, {
  Express,
  Request,
  Response,
  NextFunction
} from 'express';

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session')

var walletRouter = require('./routes/wallet')

const app: Express = express();

app.use(session({
  secret: 'near-wallet',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true
  }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/wallet', walletRouter)

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.listen(3001, () => console.log('App listening on port 3000!'));

module.exports = app;