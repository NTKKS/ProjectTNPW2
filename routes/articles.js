const express = require('express')
let Article = require('./../models/article')
const router = express.Router()
const { forwardAuthenticated,ensureAuthenticated } = require('./../config/auth')

//new post page route
router.get('/new',ensureAuthenticated, (req, res) => {
    res.render('articles/new', { article: new Article() })
})

//edit post page route
router.get('/edit/:id',ensureAuthenticated, async (req, res) => {
    const article = await Article.findById(req.params.id)
    if(req.user.id == article.author) {
        res.render('articles/edit', { article: article })
    }else{
        req.flash('error_msg', 'You are not authorized');
        req.logOut()
        res.redirect('/users/login')
    }
})

//get all articles
router.get ('/', async (req,res) => {
    let articles = await Article.find()
    res.json(articles)
})

//GET specific article (using slug instead of id)
router.get('/:slug', async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug })
    if (article == null) res.redirect('/')
    res.render('articles/show', { article: article, user: req.user })
})

//POST request handler (new article)
router.post('/', ensureAuthenticated, async (req, res, next) => {
    req.article = new Article()
    next()
}, saveArticleAndRedirect('new'))

//PUT route (edit article)
router.put('/:id',ensureAuthenticated, async (req, res, next) => {
    try {
        req.article = await Article.findById(req.params.id)
        next()
    } catch (e) {
        console.log(e)
    }
}, saveArticleAndRedirect('edit'))

//DELETE route
router.delete('/:id',ensureAuthenticated, async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/')
})

function saveArticleAndRedirect(path) {
    return async (req, res) => {
        //creating new database item
        let article = req.article
        article.title = req.body.title
        article.description = req.body.description
        article.markdown = req.body.markdown
        article.author = req.user.id
        article.authorName = req.user.name
        //save new article to database
        try {
            article = await article.save()
            res.redirect(`/articles/${article.slug}`)
        } catch (e) {
            //returns same page with filled fields
            res.render(`articles/${path}`, { article: article })
        }
    }
}

module.exports = router