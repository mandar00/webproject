require('dotenv').config()
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        requried: true
    },
    // lastname:{
    //     type:String,
    //     requried:true
    // },
    email: {
        type: String,
        requried: true
        // unique:true
    },
    // gender:{
    //     type:String,
    //     requried:true
    // },
    phoneno: {
        type: String,
        requried: true,
        // unique:true
    },
    // age:{
    //     type:String,
    //     requried:true
    // },
    password: {
        type: String,
        requried: true
    },
    tokens: [{
        token: {
            type: String,
            requried: true
        }
    }]
})

employeeSchema.methods.genrateAuthToken = async function () {
    try {
        console.log(this._id)
        const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY)
        this.tokens=this.tokens.concat({token:token})
        await this.save()
        return token
    } catch (error) {
        res.send("invalid ")
        console.log(error)
    }
}


employeeSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // if password is being modified for the first time of at the time of updating then hash it or else if t\other feilds are being modified then no need to change the password
        console.log(this.password)
        this.password = await bcrypt.hash(this.password, 10)
        console.log(this.password)
        // this.confirmpassword=undefined
    }
    next()
})

// cresting a collection
const Register = new mongoose.model("Register", employeeSchema)

module.exports = Register