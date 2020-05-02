  
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

//init express server
const express = require('express')
//layout for all pages (footer, etc)
const expressLayouts = require('express-ejs-layouts')
//init database
const mongoose = require('mongoose')
//init article model
const Article = require('./models/article')

const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')

//init routers
const articleRouter = require('./routes/articles')
const userRouter = require('./routes/users')

const methodOverride = require('method-override')
const app = express()

// Passport Config
require('./config/passport')(passport)

const { ensureAuthenticated, forwardAuthenticated } = require('./config/auth')

//connect to database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

//view engine
app.set('view engine', 'ejs')
app.set('views',__dirname + '/views')
//layouts setup (things that are same on every page)
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
//enables accessing data from form
app.use(express.urlencoded({ extended: false }))
// Express session
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true
    })
  )
// Passport middleware
app.use(passport.initialize())
app.use(passport.session())
// Connect flash
app.use(flash())
//flash messages setup
app.use(flash())
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})
//to override methods
app.use(methodOverride('_method'))

//ROUTES/////////////////////////////////////////////////////////

//route index page
app.get('/', async (req, res) => {


    //get all articles
    const articles = await Article.find().sort({createdAt: 'desc'})

    //renders the index view, passes the articles
    res.render('articles/index', {
        articles: articles,
        user: req.user
        })
})

app.use('/articles', articleRouter)
app.use('/users', userRouter)

//app runs at port specified in environment file
app.listen(process.env.PORT || 3000)