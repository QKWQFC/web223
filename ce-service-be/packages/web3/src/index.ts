require('dotenv').config();

import express from 'express';
import { headMiddleWare } from '../middleware/headerFilter';
const cors = require('cors');
const app = express();
const accountRouter = require('../routes/account')
const nftRouter = require('../routes/nft')
const marketRouter = require('../routes/market')

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use('/web3/account', headMiddleWare, accountRouter);
app.use('/web3/nft', nftRouter);
app.use('/web3/market', marketRouter)

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server running on http://localhost:${process.env.SERVER_PORT}`);
});
