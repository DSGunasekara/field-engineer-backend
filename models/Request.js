const mongoose = require('mongoose')

const RequestScheme = new mongoose.Schema({
    requiredDate:{
        type: Date,
        required: true,
        default: Date.now()
    },
    item:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
    },
    requestedUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    job:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
    },
    qty:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required: true,
        default: "Pending"
    },
    note:{
        type: String
    }
})

module.exports = mongoose.model("Request", RequestScheme);