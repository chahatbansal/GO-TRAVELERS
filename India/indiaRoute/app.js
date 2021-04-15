const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const geoip = require('geoip-lite');

const registry = require('./registry.json');
const loadbalancer = require('../util/loadbalancer');

const unregister = (serviceURL) => {
    const index= registry.services.instances.findIndex((instances)=>{
        return  serviceURL===instances.url;
    });

    registry.services.instances.splice(index,1);
    fs.writeFile('./indiaRoute/registry.json', JSON.stringify(registry), (err)=>{
        if(err){
            return 'Could not unregister: ' + "\n" + err;
        }else{
            return 'Successfully unregistered';
        }
    });
    return true;
}

router.post('/register',(req,res)=>{
    const registrationInfo = req.body;
    registrationInfo.url = registrationInfo.protocol+"://" + registrationInfo.host +":"+registrationInfo.port;
    if(apiExist(registrationInfo)){
        res.send('Service already registered: '+registrationInfo.pathName)
    }else{
        registry.services.instances.push({ ...registrationInfo })
        fs.writeFile('./indiaRoute/registry.json', JSON.stringify(registry), (err)=>{
            if(err){
                res.send('Could not register: ' +registrationInfo.pathName + "\n" + err)
            }else{
                res.send(`Successfully registered ${registrationInfo.pathName}`)
            }
        })
    }
})

router.post('/unregister',(req,res)=>{
    const registrationInfo = req.body;
    registrationInfo.url = registrationInfo.protocol+"://" + registrationInfo.host +":"+registrationInfo.port;
    if(apiExist(registrationInfo))
    {
        let response = unregister(registrationInfo.url);
        res.send(response);

    }else{
        res.send('Configuration does not exist:'+registrationInfo.pathName)
    }
})

const checkServiceStatus = async (url) => {
    try {
        const response = await axios({
            method : "GET",
            url : url + "/health-check",
        });

        return response.status === 200;
    } catch(e) {
        return false;
    }
}

router.all('*',async (req,res)=>{
    var geo = geoip.lookup(req.ip);

    let targetServer;
    let url;

    let instances = JSON.parse(JSON.stringify(registry.services.instances));

    if (geo) {
        console.log(`User is currently requesting from country ${geo.country} and city ${geo.city}`);
        targetServer = loadbalancer[registry.services.loadbalancerStratergy](instances, geo.ll);
        url = targetServer.url;
        let serviceStatus = await checkServiceStatus(url);
        while (!serviceStatus) {
            console.log(serviceStatus);
            console.log(`The request is being sent to next closest server as server located in ${targetServer.pathName} is not available`);
            let done = unregister(url);
            instances = JSON.parse(JSON.stringify(registry.services.instances));
            targetServer = loadbalancer[registry.services.loadbalancerStratergy](instances, geo.ll);
            url = targetServer.url;
            serviceStatus = await checkServiceStatus(url);
        }
    } else {
        console.log(`User location is not determined, will be forwarded to default server`);
        targetServer = registry.services.instances[0];
        url = targetServer.url;
    }
    console.log(`The request is being forwarded to the server located in ${targetServer.pathName}`);
    
    axios({
        method : req.method,
        url : url + req.originalUrl,
        headers : req.headers,
        data: req.body
    }).then((response)=>{
        res.header(response.headers);
        res.send(response.data);
    }).catch(err=>{
        res.send(err);
    });
})

const apiExist = (registerInfo)=>{
    let exists= false
    registry.services.instances.forEach(instance=>{
        if(instance.url===registerInfo.url){
            exists=true;
            return
        }
    })
    return exists;
} 
module.exports = router;
