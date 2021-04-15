const express = require('express');
const app= express();
const routes = require('./routes')
const helmet = require('helmet');
const cors = require('cors');

app.use(helmet());
app.use(express.json());
app.set('trust proxy',true);
app.use(cors({
    origin: 'http://localhost.org:8080',
    credentials: true
}));

app.use('/',routes)

app.listen(3000,(req,res)=>{
    console.log(' Gateway server started on port 3000');
})