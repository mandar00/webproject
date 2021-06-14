require('dotenv').config()
const express = require('express');
const app=express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Register = require('./models/registers');//this register will tell what should the data belike 
// const  hbs  = require('hbs');
const port =process.env.PORT ||3000

require("./db/conn")//make connection with mongodb

const staticpath=path.join(__dirname,"../public")
app.use (express.static(staticpath),)//theres a file in public folder use it as static file

const templatepath= path.join(__dirname,"../templates/views")
app.set("views",templatepath)//the views directory is changed use this path as  new views directory

app.set("view engine","hbs")//set view engine as hbs

const partials_path=path.join(__dirname,"../templates/partials")
hbs.registerPartials(partials_path)//the partiaals included in the index.hbs are stored here

app.use(express.json())//the in comming data is gonna be json data
app.use(express.urlencoded({extended:false}))

console.log(process.env.SECRET_KEY)
app.get("/",(req,res)=>{
    res.render("index")
})

app.get("/register",(req,res)=>{
    res.render("register")
})


app.post("/register",async(req,res)=>{
    try {
        console.log(req.body.firstname) //firstname is the name of input textbox
        console.log(req.body.password) //firstname is the name of input textbox
        console.log(req.body.email)
        console.log(req.body.phoneno)
        const registeremployee = new Register({
            firstname:req.body.firstname,
            password:req.body.password,
            email:req.body.email,
            phoneno:req.body.phoneno
        })

        const token=await registeremployee.genrateAuthToken()
        console.log(token)

        const saveemployee= await registeremployee.save();
        res.status(201).render( 'index')
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
    
})  

app.get("/login",(req,res)=>{
    res.render("login")
})


app.post("/login", async(req,res)=>{
    try {
        const email= req.body.email
        const password= req.body.password//mandar
        console.log(`email is ${email} and password is ${password}`)
        const useremail= await Register.findOne({email:email})
        console.log(useremail)
        const ismatch= await  bcrypt.compare(password,useremail.password)
        console.log(ismatch)
        const token=await useremail.genrateAuthToken()
        console.log(token)//create a token every time i log in and store it in an array 

        if(ismatch){
            res.status(201).render("index")
        }else{
            res.status(400).send("invalid details")
        }


    } catch (error) {
        res.send("invalid details")
    } 
})
// const createToken = async(req,res)=>{
//   const token = await  jwt.sign({_id:"60c5dcadafeeac555c006c1a"},"kasasdasadawefasakfnjobsdcaccccccccccccccccccaaaaaaaaa",{
//       expiresIn:"2seconds"//after how much time will the token expire  genrally used in payment sites 
//   })
//   console.log(token)//show the genrated token 
//   const userver= await jwt.verify(token,"kasasdasadawefasakfnjobsdcaccccccccccccccccccaaaaaaaaa")
//   console.log(userver)//check if the given secret belongs to given token if yes then show the id 
// }
// createToken()

app.listen(port ,()=>{
    console.log(`server is running at ${port}`)
})