const express = require('express');
const app= express();
const axios = require('axios')
const HOST = 'localhost'
const routes = require('./indiaRoute/app.js')
const PORT= 3002
const helmet = require('helmet');

app.use(helmet());
app.use(express.json());
app.set('trust proxy',true);

// app.get('/demoApi',(req,res)=>{
//     res.send('Hiii from India');
// })
// app.post('/postDemo',(req,res)=>{
//     res.send('Post Api from India')
// })
app.use('/',routes);

app.listen( PORT , ()=>{
    axios({
        method:'POST',
        url : 'http://localhost:3000/register',
        headers :{'Content-Type': 'application/json'},
        data: {
            apiName :"India",
            protocol:"http",
            host :HOST,
            port : PORT,
        }
    }).then((res)=>{
        console.log(res.data);
    })
    console.log("India Server started on port 3002");
})