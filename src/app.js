require('dotenv').config()
const express = require('express');
const app=express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');
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

app.use(cookieParser())
console.log(`this is secrret key ${process.env.SECRET_KEY}`)
app.get("/",(req,res)=>{
    res.render("index")
})

app.get("/secret",auth,(req,res)=>{
    console.log(` this is the jwt token ${req.cookies.jwt}`)//if any one goes to the secret page then console.log() the data of  cokkie jwt
    res.render("secret")
})

app.get("/logout",auth, async(req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((ele)=>{
            return ele.token != req.token
        })//this is to remove the user from the device it is signed in  
        //to remove him from all the devices
        req.user.tokens=[]
        res.clearCookie("jwt")
        res.status(201).send("logeed out sucessfully")
        await req.user.save()
    } catch (error) {
        res.status(500).send(error)
    }
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
        console.log(`this is token ${token}`)
        res.cookie("jwt",token,{
            expires:new Date(Date.now()),
            httpOnly:true
        })
        
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
        res.cookie("jwt",token,{
            expires:new Date(Date.now() + 300000),
            httpOnly:true
        })


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

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGM1ZGNhZGFmZWVhYzU1NWMwMDZjMWEiLCJpYXQiOjE2MjM2NzIzODZ9.G8x6xW65_3lo6SPQA5Q4Y4BiDR3BPVsLDrXxm06nQaQ