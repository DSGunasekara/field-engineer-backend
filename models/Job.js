const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  date: {
    type: Date,
    require: true,
  },
  startedTime:{
    type: Date,
  },
  endTime: {
    type: Date,
  },
  status: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  svrId: {
    type: String,
  },
  lconName: {
    type: String,
    required: true,
  },
  lconContactNo: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
  },
  starRate:{
    type: Number,
    default: 0
  },
  category: {
    type: String,
  },
  requiredEngineers: {
    type: Number,
    required: true,
  },
  assignedEngineers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  customer:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  jobImages:[
    {
      ImageUrl: {
        type: String
      },
      UserName: {
        type: String
      }, 
      note:{
        type: String
      },
      status: {
        type: String,
        default: 'Pending'
      }
    }
  ]
});

module.exports = mongoose.model("Job", JobSchema);
