const express= require('express')
const { health } = require('../controllers/health')
const routeAPI= express.Router()
routeAPI.get('/test',health)
module.exports=routeAPI;