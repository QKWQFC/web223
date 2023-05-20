require('dotenv').config();
const cors = require('cors');
const kakaoRouter = require('../routes/kakao')
var logger = require('morgan');
import express from 'express';

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use('/auth', kakaoRouter)

app.listen(process.env.SERVER_PORT);