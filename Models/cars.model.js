const mongoose = require('mongoose')

const carSchema=mongoose.Schema({
        imagesrc: String,
        imagesrc2:String ,
        imagesrc3: String,
        imagesrc4: String,
        imagesrc5: String,
        ratingtext:String ,
        state:String,
        city:String,
        title: String,
        detailsitem: String,
        detailsitem2:String ,
        detailsitem3: String,
        pricediscounted: String,
        priceoriginal: String,
  })
  // car is a collection and it will be created auto if not present in db
  const CarModel=mongoose.model("car",carSchema)

  module.exports={
    CarModel
  }