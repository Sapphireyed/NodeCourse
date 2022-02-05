const express = require('express');
const fs = require('fs')
const morgan = require('morgan') // login middleware

const tourRouter = require('./routes/tourRoutes')

const app = express()

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json()) //middleware to have data avilable on request in post methode (req.body)
app.use(express.static(`${__dirname}/public`))  // not needed here, just to show how to serve static resources with express

app.use((req, res, next) => {
    // our own middleware
    req.requestTime = new Date().toISOString() ;
    next(); //ALWAYS NEEDED
})


// code outseide of get() runs only once
// JSON.parse to get json as js object/array of js objects
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

//2) handlesrs (should be only habndlers => function)

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
const userRouter = express.Router()

userRouter.route('/')
   .get(getAllUsers)
   .post(createUSer)

   userRouter.route('/:id')
   .get(getUser)
   .patch(updateUser)
   .delete(deleteUSer)

app.use('/api/v1/users', userRouter)
app.use('/api/v1/tours', tourRouter)

module.exports = app;