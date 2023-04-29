const express=  require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('dotenv').config();

const mongoDb =  process.env.MONGODB_URI;
mongoose.connect(mongoDb,{useUnifiedTopology:true, useNewUrlParser:true });
const db = mongoose.connect();
db.on('error',console.error.bind(console,'Mongo Connection Error'));

const User = mongoose.model(
  'User',
  new Schema({
    username:{ type:String, required:true },
    password:{ type:String, required:true },
  }),
);

const app = express();
app.set('views',__dirname);
app.set('view engine', 'ejs');

app.use(session({ secret:'dogs', resave:false, saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended:false}));

app.get('/',(req,res)=>res.render('index'));

app.listen(3000,()=>console.log('App Listening on port 3000'));
