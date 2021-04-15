const express = require('express');
const router= express.Router();
const axios = require('axios');
const fs = require('fs');

const registry = require('./registry.json');

router.post('/register',(req,res)=>{
    const registrationInfo = req.body;
    registrationInfo.url = registrationInfo.protocol+"://" + registrationInfo.host +":"+registrationInfo.port;
    if(apiExist(registrationInfo)){
        res.send('Service already registered: '+registrationInfo.apiName)
    }else{
        registry.services[registrationInfo.apiName] = {'instance': {...registrationInfo}};
        fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err)=>{
            if(err){
                res.send('Could not register' +registrationInfo.apiName + "\n" + err)
            }else{
                res.send(`Successfully registered ${registrationInfo.apiName}`)
            }
        })
    }
})
 
router.post('/unregister',(req,res)=>{
    const registrationInfo = req.body;
    if(apiExist(registrationInfo))
    {
        let services = registry.services;
        delete services[registrationInfo.apiName];
        registry.services = services;
        fs.writeFile('./routes/registry.json', JSON.stringify(registry), (err)=>{
            if(err){
                res.send('Could not unregister' +registrationInfo.apiName + "\n" + err)
            }else{
                res.send(`Successfully unregistered ${registrationInfo.apiName}`)
            }
        })

    }else{
        res.send('Configuration does not exist:'+registrationInfo.apiName)
    }
})

router.all('/:apiName/*',(req,res)=>{

    const service = registry.services[req.params.apiName]

    if(service)
    {
        const url = service.instance.url;
        console.log(`Request is forwarded to server ${service.instance.apiName}`);

        let requestPath =  req.originalUrl;
        requestPath = requestPath.split('/'+ req.params.apiName).pop();

        axios({
            method : req.method,
            url : url + requestPath,
            headers : req.headers,
            data: req.body
        }).then((response)=>{
            res.header(response.headers);
            res.send(response.data);
        }).catch(err=>{
            res.send(err)
        })
    }else{
        res.send('Undefined API call')
    }
})

const apiExist = (registerInfo)=>{
    return registry.services[registerInfo.apiName] != undefined;
} 
module.exports = router;

//registry.services[req.params.apiName].url+req.params.path