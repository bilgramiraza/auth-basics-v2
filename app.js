const express=  require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('dotenv').config();
const bcrypt = require('bcrypt');

const mongoDb =  process.env.MONGODB_URI;
mongoose.connect(mongoDb,{useUnifiedTopology:true, useNewUrlParser:true });
const db = mongoose.connection;
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

passport.use(
  new LocalStrategy(async(username, password, done)=>{
    try{
      const user = await User.findOne({username:username});
      if(!user) return done(null, false, {message: 'Incorrect Username'});

      const passwordCheck = await bcrypt.compare(password, user.password);
      if(!passwordCheck)  return done(null, false, {message: 'Incorrect Password'});

      return done(null, user);
    }catch(err){
      return done(err);
    }
  }),
);
passport.serializeUser(function(user,done){
  done(null, user.id);
});
passport.deserializeUser(async function(id,done){
  try{
    const user = await User.findById(id);
    done(null, user);
  }catch(err){
    done(err);
  }
});

app.use(session({ secret:'dogs', resave:false, saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended:false}));

app.get('/',(req,res)=>res.render('index',{user: req.user}));

app.get('/signup',(req, res) => res.render('signUpForm'));

app.post('/signup', async (req, res, next) =>{
  try{
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    return res.redirect('/');
  }catch(err){
    return next(err);
  }
});

app.post(
  '/login',
  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/'
  })
);

app.get('/logout',(req, res, next) => {
  req.logout(function (err){
    if(err) return next(err);

    res.redirect('/');
  });
});

app.listen(3000,()=>console.log('App Listening on port 3000'));
