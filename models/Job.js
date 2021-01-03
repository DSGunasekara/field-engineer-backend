const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  date: {
    type: Date,
    require: true,
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
});

module.exports = mongoose.model("Job", JobSchema);
