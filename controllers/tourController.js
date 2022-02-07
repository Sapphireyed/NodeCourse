//const fs = require('fs')
const { countDocuments } = require('./../models/tourModel')
const Tour = require('./../models/tourModel')
const APIFeatures = require('./../utils/apiFeatures')


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

exports.getAllTours = async (req, res) => {
    try {
        // BUILD QUERY
        // 1a) filtering
        // 2) SORTING
        // 3) LIMIT fields
        // 4) PAGINATION

        // EXECUTE QUERY
        // const tours = await query
        const features = new APIFeatures(Tour.find(), req.query)
                .filter()
                .sort()
                .limit()
                .paginate()

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

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([ 
            {
                $match: { ratingsAverage: { $gte: 4.5 }}
            },
            {
                $group: {
                    //_id: null,     // to get all of them
                    _id: '$difficulty',
                    // _id: { $toUpper: '$difficulty'}
                    numTours: { $sum: 1 },    // for each of the documents it goes through it adds 1
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minProce: { $min: '$price' },
                    maxProce: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            },
            // {   // repeating stages is possible
            //     $match: { _id: { $ne: 'easy'}}
            // }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: 'err" ' + err
        })
    }
}

exports.getTourPlan = async (req, res) => {
    try {
        const year = req.params.year * 1
        const plan = await Tour.aggregate([ 
            {
                $unwind: '$startDates'   // deconstructs an array field from the input documents and outputs one document for each element of the array
                                         // so we have now each document in as amny copies as they have start dates in the array, 
                                         // one for each start date
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year-01-01}`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates'},
                    numToursStarts: { $sum: 1},
                    tours: { $push: '$name' }   // $push to create an array
                }
            },
            {
                $addFields: { month: '$_id'}
            },
            {
                $project: {   // we add a val 0 or 1 to each field to decide if it will show up in results
                    _id: 0
                }
            },
            {
                $sort: { numToursStarts: -1}   // -1 for descending
            }
            // {
            //     $limit: 4
            // }

        ])
//  $group, $unwind, $match etc are aggregation pipeline stages
//  $month is an aggregation pipeline operatior
        // 
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: 'err" ' + err
        })
    }
}