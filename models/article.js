const mongoose = require('mongoose') //database
const slugify = require('slugify') //slug generator
//markdown setup
const marked = require('marked') //markdown
const createDomPurifify = require('dompurify')
const { JSDOM } = require('jsdom')//to render html
const dompurify = createDomPurifify(new JSDOM().window)//to purify html code

//article structure for database
const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    //generates article url from title
    slug: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedHtml: {
        type: String,
        required: true
    }
})

//slug setup, validation

articleSchema.pre('validate', function(next) {
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true })
    }

    if (this.markdown) {
        this.sanitizedHtml = dompurify.sanitize(marked(this.markdown))
    }

    next()
})

module.exports = mongoose.model('Article', articleSchema)