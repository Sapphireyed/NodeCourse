const express = require('express')
const tourController = require('./../controllers/tourController')

const router = express.Router()

//middleware that works for specific parameters -> here for id. 
//router.param('id', tourController.checkID)

// creating alias for a popular, often used route
router.route('/top-5-cheap').get(tourController.aliasTopTourstours, tourController.getAllTours)
router.route('/tour-stats').get(tourController.getTourStats)

router.route('/')
   .get(tourController.getAllTours)
   .post( tourController.createTour) // chaining middlewares

router.route('/:id')
   .get(tourController.getTour)
   .patch(tourController.updateTour)
   .delete(tourController.deleteTour)

module.exports = router