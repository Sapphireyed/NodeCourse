const express = require('express');
const fs = require('fs')
const morgan = require('morgan') // login middleware

const app = express()

// 1) MIDDLEWARES
app.use(morgan('dev'))
app.use(express.json()) //middleware to have data avilable on request in post methode (req.body)

app.use((req, res, next) => {
    // our own middleware
    req.requestTime = new Date().toISOString() ;
    next(); //ALWAYS NEEDED
})


// code outseide of get() runs only once
// JSON.parse to get json as js object/array of js objects
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

//2) handlesrs (should be only habndlers => function)
app.get('/api/v1/tours', (req, res) => {
    res
    .status(200)
    .json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours // if name and resource have smae name only one  name is enoug
        }
    })
})

app.get('/api/v1/tours/:id', (req, res) => {
    const tour = tours.find(el => el.id === (req.params.id *1))
    res
    .status(200)
    .json({
        status: "success",
        data: {
            tour
        }
    })
})

app.post('/api/v1/tours', (req, res) => {
    const newId = tours[tours.length-1].id + 1 // if we use a db id will be created automatically, no need to add it
    const newTour = Object.assign({id: newId}, req.body);

    tours.push(newTour)
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), er => {
        res
        .status(201) // 201 = created; 204 = for delete, no data;
        .json({ 
            status: 'success',
            data: {
                tour: newTour
            }
        })
    })
})

const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "not yet implemented"
    })
}

const createUSer = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "not yet implemented"
    })
}

const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "not yet implemented"
    })
}

const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "not yet implemented"
    })
}

const deleteUSer = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: "not yet implemented"
    })
}

// 3) ROUTES
// refactor the code => put functions in seperate functions, routes only with url and function name
const tourRouter = express.Router()
const userRouter = express.Router()
// tourRouter.route('/api/v1/tours')
//    .get(getAllTiyrs)
//    .post(createTour)

// tourRouter.route('api/v1/tours/:id')
//    .get(getTour)
//    .patch(updateTour)
//    .delete(deleteTour)

userRouter.route('/')
   .get(getAllUsers)
   .post(createUSer)

   userRouter.route('/:id')
   .get(getUser)
   .patch(updateUser)
   .delete(deleteUSer)

app.use('/api/v1/users', userRouter)
app.use('/api/v1/tours', tourRouter)
// 4) SERVER
const port = 3000
app.listen(port, () => {
    console.log(`app running on port ${port}...`)
})

///
///
//  MONGO

// use => to create or switch to database

// first create collection 
// and document inside it // CREATE

// db.collectionName.insertOne({ name: whatever1, price: 333})
// db.collectionName.insertMany([{ name: "whatever2", price: 433}, {name: "whatever3", price: 222}])
// show dbs => see all databases
// show collections => see all collections in a given db

// iterating / READ
// db.collectionName.find() => displays all
// db.collectionName.find( { name: "The Forest Hiker"} )
// iterating with operators (less than etc) requires knowing these operators in mongo

// ex
// db.collectionName.find( { price: {$lte: 500} } )
// $lte = <= less than or equal
// $lt = < less than
// $gte = >= greater than or equal

// multiple conditions:
// 1) and => db.collName.find({ condition, condition })
// 2) or => db.collName.find({ $or: [condition, condition] })
// 
// adjusting output ex. make only name to show up in results:
// db.collName.find({ $or: [condition, condition] }, { name: 1 })

// UPDATE
// db.collectionName.updateOne({ name: whatever1 }, { $set: { price: 597 }} )      IF the filter matches multiple object only the first one will be updated
// db.collectionName.updateMany({ conditions }, { what to update})
// ex
// db.tours.updateMany({ price: {$gte: 500}, rating: {$gte: 4.8}}, { $set: { premium: true }})
// to completly replace
//db.colName.replaceOne() / replaceMAny()

// DELETE
// db.colName.deleteOne()
// db.colName.deleteMany( { rating: {$lt: 4.8}} )
// db.colName.deleteMany( { } )    ==> deletes all documents in the collection  NO COMING BACK



// quit()