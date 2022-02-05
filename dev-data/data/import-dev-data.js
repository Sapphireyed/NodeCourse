const dotenv = require('dotenv')
const fs = require('fs')
const mongoose = require('mongoose') 
const Tour = require('./../../models/tourModel')
dotenv.config({ path: './config.env'})

console.log('dotenv', process.env)
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true 
}).then(con => console.log('DB connection successfull'))

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours)
        // create function can accept an object or an array of objects
        // in case of array it'll create new document for each object in the array
        console.log('data sucessfully loaded')
    } catch (err) {
        console.log('err', err)
    }
    process.exit()
}

// delete all data from collection
const deleteData = async() => {
    try {
        await Tour.deleteMany()
        // sama name as in mongo
        console.log('data sucessfully deleted')
    } catch (err) {
        console.log('err', err)
    }
    process.exit()
}

// run the function in command line
if (process.argv[2] === '--import') {
    importData()
} else if ( process.argv[2] === '--delete') {
    deleteData()
}