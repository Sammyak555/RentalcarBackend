const mongoose = require("mongoose")

const userSchema=mongoose.Schema({
    username:String,
    email:String,
    password:String,
    booking:Array
})

const UserModel = mongoose.model('user',userSchema)

module.exports={
    UserModel
}