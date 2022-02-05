const mongoose = require('mongoose')  // to connect node app to mongo db
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
    statDates: [Date]
})
// MODEL   name in upperCase
const Tour = mongoose.model('Tour', tourSchema)  // name, schema

module.exports = Tour
