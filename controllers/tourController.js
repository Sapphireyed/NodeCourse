//const fs = require('fs')
const { countDocuments } = require('./../models/tourModel')
const Tour = require('./../models/tourModel')


//importing data from file
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


// middleware to check id
// exports.checkID = (req, res, next, val) => {
//     console.log(`the id of this request is ${val}`) //val is the value of param, in this case of id
//     if (req.params.id *1 > tours.length) {
//         return res.status(404).json({  // return needed bc otherwise it'd still run 
//             status: "fail",
//             message: "invalid id"
//         })
//     }
//     next()
// }

// exports.checkBody = (req, res, next) => {
//     console.log(`the body name of this request is ${req.body.name}`) //val is the value of param, in this case of id
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({ 
//             status: "fail",
//             message: "missing name or price"
//         })
//     }
//     next()
// }

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString
    }

    filter() {
        const queryObj = {...this.queryString} 
        const exludedFields = ['page', 'sort', 'limit', 'fields']
        exludedFields.forEach(el => delete queryObj[el])
        // queryObj = req.body can't be used bc then we'd modify both objects
        // with destructuring and creating new give the new object and different reference, not req.query
        //const tours = await Tour.find()  //get all tours
        //const tours = await Tour.find(req.query)    // get filtered tours

        // 1b) advanced filtering
        let  queryString = JSON.stringify(queryObj)
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) //we add & to req.query to make it match mongo filtering

        //let query = Tour.find(JSON.parse(queryString))       // get filtered tours
        this.query.find(JSON.parse(queryString))

        // SOME EXPLANATION
        // Tour.find(queryObj) returns object. If we await it straight away we won't be able to use some of it's functions later om
        // like sort etc
        // that's why we first create the query variable without await
        // then, lower, we will await it to asign to tour variable.
        // does it make sense ? Nope xD 

        // const easyQuery = await Tour.find({
        //     difficulty: "easy "
        // })
        // const easyQuery2 = await Tour.find()
        //         .where('difficulty')
        //         .equals('easy')
        //         .where('duration')
        //         .lte(5)

        // filter object in mongo, as reminder: {diffivulty: 'easy', duration: {$gte > 5}}
        // in url: url?difficulty=easy&duration[gte]=5
        // now req query looks like this:
        // {diffivulty: 'easy', duration: {gte > 5}} 
        // do almost identical to mongo filter object

        return this
    }
}

exports.getAllTours = async (req, res) => {
    try {
        // BUILD QUERY
        // 1a) filtering
       let query = Tour.find()

        // 2) SORTING
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        } else {
            query = query.sort('-createdAt _id')
        }
        // to sort by multiple criterie, in case of a tie a 2nd one comes 
        // query.sort('price ratingsAvarag')
        // but in url we can't use space, we use come. So in code we need to replace coma with a space -> sortBy above

        // 3) LIMIT fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields) 
        } else {
            query = query.select('-__v')  // minus excludes things. so everything except for __v will show up
        }

        // 4) PAGINATION
        const page = req.query.page * 1 || 1 // converts to number
        const limit = req.query.limit * 1 || 100
        const skip = (page-1) * limit  // previous page compared to the requested * limit (page 3: 2 * 10, 21-30)
        console.log('skip', skip)
        // url?page=2$limit=10   page1: 1-10, page2=11-20
        // query = query.skip(10).limit(10)    // skips 10 results, shows 10 results
        query = query.skip(skip).limit(limit)

        if (req.query.page) {
            const numTours = await Tour.countDocuments()
            if (skip >= numTours)  throw new Error('This page does not exist')
        }

        // EXECUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query).filter()
        // const tours = await query
        const tours = await features.query
        // query.sort().select().skip().limit()

        // SEND RESPONSE
        res
        .status(200)
        .json({
            status: 'success',
            results: tours.length,
            data: {
               tours
           }
        })
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: 'err: ' +  err
        })
    }

}

exports.createTour = async (req, res) => {
    // const newId = tours[tours.length-1].id + 1 // if we use a db id will be created automatically, no need to add it
    // const newTour = Object.assign({id: newId}, req.body);

   // await Tour.create({}) // does the same as above BUT there it was done on new document and here it's done directly on Tour

   try {   // REQUIRED FOR ASYNC AWAIT !!!
    const newTour = await Tour.create(req.body)
    res
    .status(201) // 201 = created; 204 = for delete, no data;
    .json({ 
        status: 'success',
        data: {
            tour: newTour
        }
    })
   } catch(err) {
    console.log('err', err)
    res.status(400).json({
        status: "fail",
        message: err
    })
   }


    // tours.push(newTour)
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), er => {

    //})
}

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        // Tour.fibdOne({ _id: req.params.id})
        res
        .status(200)
        .json({ 
            status: 'success',
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: 'err: ' + err
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,     // we want to return this new document to the client
            runValidators: true   // runs all the alidations again
        }) 
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: 'err" ' + err
        })
    }

}

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id) 
        res.status(204).json({
            status: 'success',
            data: {
                tour: null
            }
        })
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: 'err" ' + err
        })
    }
}

exports.aliasTopTourstours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty'
    next()
}

