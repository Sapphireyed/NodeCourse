const mongoose = require('mongoose')  // to connect node app to mongo db
const slugify = require('slugify')   // to use a slug in url instead of long weird id
//creating schema to create model to interacte with mongoDB
//SCHEMA
const tourSchema =  mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour mast have a name'],    // validator
        unique: true,
        index: true,
        trim: true,
        default: 'abc' // won't work in here bc it's required, but good to know how to do it
    },
    slug: String,
    duration: {
        type: Number
    },
    maxGroupSize: {
        type: Number
    },
    difficulty: {
        type: String
    },
    ratingsAverage: Number,
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Tour mast have a price']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true    // only for Strings. removes whitespace in the beginning and in the end
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String   // could be put an actual image but a common  practice is to keep pics in a file system and put in schema only a name
    },
    images: [String],    // array of strings (pics names)
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false  // never will show up in results sent to client
    },
    startDates: [Date],
    secret: {
        type: Boolean,
        default: false
    }
}, { // first object, above, is schema deffinition, 2nd, below, options
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
    // when data gets outputed as json or object virtuals are shown.
})

// VIRTUAL PROPERTIES
// added to model but won't be saved in database
// used to not take space in db
// f.ex converting miles to km. It's enough to have only one in db
// virtual properties ncan't be used in queries -> they;re not part of database

tourSchema.virtual('durationInWeeks').get(function() {  // funkcja strzalkowa nie zadziala bo 'this'
    return this.duration / 7 
})
// error function doesn't have access to 'this' so we use regular function

// middlewares are sometimes called hooks

// MONGOOSE MIDDLEWARE
// 1) Document middleware  runs before .save() and .create() not f.ex on insertMany()
tourSchema.pre('save', function(next) {
    console.log('this in doccument middleware', this)  // this => document that is currently processd
    this.slug = slugify(this.name, {lower: true})
    next()
})  

tourSchema.post('save', function(doc, next){ //instead of this we have doc => a finished document that has been saved in db
    next()
})

// QUERY MIDDLEWARE  runs before of ater querying is executed f.ex. find
tourSchema.pre(/^find/, function(next) {   // works for all the expressions that start with find => findOne, findOneAndDelete etc
    console.log('this in query middleware', this)  // this => query that is currently processd
    this.find({ secret: {$ne: true} })
    next()
})

tourSchema.post(/^find/, function(docs, next){ //instead of this we have docs =>all the documents returned by query
    next()
})

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {  
    console.log('this in aggregation middleware', this.pipeline())  // this => current aggregation object
                                                                    // this.piepline() => the pipeline we created while creating aggregation with $match etc
    this.pipeline().unshift({ $match: { secret: {$ne: true } }})    // to add it at the beginning of piepline array
    next()
})


// MODEL   name in upperCase
const Tour = mongoose.model('Tour', tourSchema)  // name, schema

module.exports = Tour
