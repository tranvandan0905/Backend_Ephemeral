require('dotenv').config()
const experess= require('express')
const routeAPI=require('./routes/routeAPI')
const app=experess()
app.use(experess.json())
app.use('/api',routeAPI)
app.listen(process.env.POST,()=>{
    console.log("Kết nối thành công");
});
