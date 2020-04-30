const express = require('express')
let Article = require('./../models/article')
const router = express.Router()

//new post page route
router.get('/new', (req, res) => {
    res.render('articles/new', { article: new Article() })
})

//edit post page route
router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id)
    res.render('articles/edit', { article: article })
})

//route to specific article (using slug instead of id)
router.get('/:slug', async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug })
    if (article == null) res.redirect('/')
    res.render('articles/show', { article: article })
})

//post request handler
router.post('/', async (req, res, next) => {
    req.article = new Article()
    next()
}, saveArticleAndRedirect('new'))

//PUT route
router.put('/:id', async (req, res, next) => {
    try {
        req.article = await Article.findById(req.params.id)
        next()
    } catch (e) {
        console.log(e)
    }
}, saveArticleAndRedirect('edit'))

//delete route
router.delete('/:id', async (req, res) => {
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