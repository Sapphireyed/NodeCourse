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
        this.query = this.query.find(JSON.parse(queryString))       // get filtered tours

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

        return this  // IMPORTANT needs to be returned so we can chain next methods. 
                     // We can't chain them if we don't return the object that recognizes them
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt _id')
        }
        // to sort by multiple criterie, in case of a tie a 2nd one comes 
        // query.sort('price ratingsAvarag')
        // but in url we can't use space, we use come. So in code we need to replace coma with a space -> sortBy above
        return this
    }

    limit() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields) 
        } else {
            this.query = this.query.select('-__v')  // minus excludes things. so everything except for __v will show up
        }
        return this
    }

    paginate() {
        const page = this.queryString.page * 1 || 1 // converts to number
        const limit = this.queryString.limit * 1 || 100
        const skip = (page-1) * limit  // previous page compared to the requested * limit (page 3: 2 * 10, 21-30)
        // url?page=2$limit=10   page1: 1-10, page2=11-20
        // query = query.skip(10).limit(10)    // skips 10 results, shows 10 results
        this.query = this.query.skip(skip).limit(limit)

        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments()
        //     if (skip >= numTours)  throw new Error('This page does not exist')
        // }
        return this
    }
}
module.exports = APIFeatures