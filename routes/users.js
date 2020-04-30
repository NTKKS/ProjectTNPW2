if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const methoOverride = require('method-override')

//passport setup
const passport = require('passport')
const initializePassport = require('./../passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

//enables to access req.body parameters
router.use(express.urlencoded({ extended: false }))

router.use(flash())
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
router.use(passport.initialize())
router.use(passport.session())
router.use(methoOverride('_method'))

//login route
router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('users/login')
})

//register route
router.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('users/register')
})

//register handler
router.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('./login')
    } catch{
        res.redirect('./register')
    }
})

//login handler
router.post('/login', checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect:'./login',
    failureFlash:true
}))
//logout handler
router.delete('/logout', checkAuthenticated, (req,res) => {
req.logOut()
res.redirect('/login')
})

//is user logged?
function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('./login')
}
//is user not logged?
function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

module.exports = router