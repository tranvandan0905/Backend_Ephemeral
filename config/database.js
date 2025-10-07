require('dotenv').config()
const mongose= require('mongoose')
const connertion = async()=>{
    try {
        await mongose.connect(process.env.DB_URI);

    } catch (error) {
        console.log(error);
    }
}
module.exports=connertion;