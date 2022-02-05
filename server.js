const dotenv = require('dotenv')
dotenv.config({ path: './config.env' }); //reads all the variables from config.env and saves them to nodejs enviroment variables
const mongoose = require('mongoose')  // to connect node app to mongo db
//console.log(process.env)
//dotenv.config must be before app
const app = require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true 
}).then(con => console.log('DB connection successfull'))

console.log('db', process.env.DATABASE)
// // creating testing etc
// const testTour = new Tour({
//     name: "The Park",
//     price: 777
// })

// //save it in db
// testTour.save().then(doc => {
//     console.log('doc', doc)
// }).catch(err => {
//     console.log('err', err)
// })

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`app running on port ${port}....`)
})