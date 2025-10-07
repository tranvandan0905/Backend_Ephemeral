require('dotenv').config()
const experess= require('express')
const connection= require('./config/database')
const routeAPI=require('./routes/routeAPI')
const app=experess()
app.use(experess.json())

app.use('/api',routeAPI)
(async ()=>{
    try {
        await connection();
        console.log("Đã kết nối DB thành công!")
    } catch (error) {
        console.log(error);
    }
})
app.listen(process.env.POST,()=>{
    console.log("Kết nối thành công");
});
