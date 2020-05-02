if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const methoOverride = require('method-override')
const session = require('express-session')
const flash = require('express-flash')
const { forwardAuthenticated,ensureAuthenticated } = require('./../config/auth')

//unit user model & users
const User = require('./../models/user')

//enables to access req.body parameters
router.use(express.urlencoded({ extended: false }))

router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

router.use(methoOverride('_method'))

//CRUD OPERATIONS////////////////////////////////////////////////

//get all users
router.get ('/', async (req,res) => {
    let users = await User.find()
    res.json(users)
    //console.log(req.user)
    //console.log(req.isAuthenticated())
})

//login route
router.get('/login', (req, res) => {
    res.render('users/login')
})

//register route
router.get('/register', (req, res) => {
    res.render('users/register')
})

//register handler
router.post('/register', (req, res) => {
    const { name, email, password } = req.body
    //message setup
    let errors = []
    if (!name || !email || !password) {
      errors.push({ msg: 'Please enter all fields' })
    }
    /*
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' })
    }
    */
    if (errors.length > 0) {
      res.render('users/register', {
        errors,
        name,
        email,
        password
      })
    } else {
      //look if email already exist
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: `Email: ${email} is already registered`})
          res.render('users/register', {
            errors,
            name,
            email,
            password
          })
        } else {
          //create new user
          const newUser = new User({
            name,
            email,
            password
          });
          //generate bcrypt hash passwort
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              //save new user
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are now registered and can log in'
                  );
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
  });
  
//login handler
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
})


//logout handler
router.delete('/logout', (req, res) => {
    req.logOut()
    req.flash('success_mgs','You are logged out')
    res.redirect('/users/login')
})

module.exports = router