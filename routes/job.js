const router = require("express").Router();
const Job = require("../models/Job");
const User = require("../models/User");
const multer = require('multer')
const verify = require("../middleware/verify");

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads/')
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + file.originalname)
  }
})

const upload = multer({storage: storage})

//get all jobs
router.get("/", verify, async (req, res) => {
  try {
    // if (req.user.role != "Admin") return res.status(403).send("Auth Failed");
    await Job.find({})
      .populate({
        path: "assignedEngineers",
        select: "-password",
      })
      .exec()
      .then((jobs, error) => {
        if (error) return res.status(400).send(error);
        return res.status(200).send(jobs);
      });
  } catch (error) {
    return res.status(500).send(error);
  }
});

//get one job
router.get("/:id", verify, async (req, res) => {
  try {
    await Job.findOne({ _id: req.params.id })
      .populate({
        path: "assignedEngineers",
        select: "-password",
      })
      .exec()
      .then((job, error) => {
        if (error) return res.status(400).send(error);
        return res.status(200).send(job);
      });
  } catch (error) {
    return res.status(500).send(error);
  }
});

//get user jobs
router.get("/user/:id", verify, async(req, res)=>{
  try {
    const jobs = await Job.find({assignedEngineers: req.body.engineer})
    return res.status(200).send(jobs);
  } catch (error) {
    return res.status(500).send(error)
  }
})

//post a job
router.post("/", verify, async (req, res) => {
  try {
    const job = new Job({ ...req.body });

    job.save((error, _) => {
      if (error) {
        console.log(error);
        return res.status(400).send(error);
      }
      return res.status(200).send(job);
    });
  } catch (error) {
    return res.status(500).send(error);
  }
});

//update a job
router.patch("/:id", verify, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id });
    const prevDate = job.date
    
    if (!job) return res.status(404).send("Job does not exits");
    if (job.requiredEngineers >= job.assignedEngineers.length){
      await Job.updateOne({ _id: job._id }, {...req.body});
      const newjob = await Job.findOne({ _id: req.params.id });
      

      if(prevDate.toDateString() !== newjob.date.toDateString()){ //Resheduling makes the start and end date null
        newjob.status = 'Reschedule'
        newjob.endTime = undefined
        newjob.startedTime = undefined
        await newjob.save()
      }

      const { setDate } = req.body;
      if(setDate === true){
       return res.status(200).send("Job Updated") 
      }

      if(req.user.role != "Admin"){
        const engineer = await User.findById({_id: req.user.id});
        engineer.jobHistory.push(job._id);
        await engineer.save();
      }
    }  
    //TODO: update engineer job list history
    return res.status(200).send("Job updated");
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

// upload images
router.patch(
  "/upload/:id",
  verify,
  upload.single("jobImg"),
  async (req, res) => {
    try {
      const job = await Job.findById({_id: req.params.id})
      if (!job) {
        return res.status(404).send("Job does not exits");
      }

      const img = {
        ImageUrl: req.file.path,
        UserName: req.body.name,
        note: req.body.note
      }

      job.jobImages.push(img);
      await job.save()
      return res.status(200).send(job)

    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }
);

//approve images
router.patch('/updateImgs/:id', async(req, res)=>{
  try {
    await Job.updateOne({'jobImages._id': req.params.id}, {$set:{'jobImages.$.status': req.body.status}})

    return res.status(200).send("updated")
  } catch (error) {
    console.log(error);
    return res.status(500).send(error)
  }
})

//add a engineer to the job
router.patch("/assignEngineer/:id", async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) {
      return res.status(404).send("Job does not exits");
    }
  
    const user = await User.findOne({ _id: req.body.engineer });
    if (!user) {
      return res.status(404).send("No user found");
    }

    const checkEngineer = await Job.findOne({ _id: job._id, assignedEngineers: req.body.engineer});
    
    if (checkEngineer) return res.status(409).send("Engineer already assigned");

    const jobDate = job.date.toISOString().substr(0, 10);
    const endDate = new Date(jobDate);
    let day = jobDate.substr(8, 10);

    endDate.setDate(parseInt(day) + 1);


    const jobList = await Job.find({
      assignedEngineers: user,
      date: { $gte: jobDate, $lt: endDate.toISOString().substr(0, 10) },
    });

    if (jobList.length !== 0) {
      return res.status(409).send("Engineer job date conflict");
    }

    if (user.availability === false)
      return res
        .status(400)
        .send("Engineer availability is set to unavailable");

    if (job.requiredEngineers > job.assignedEngineers.length) {

      const engineerId = user._id;
      job.assignedEngineers.push(engineerId);
      if (job.requiredEngineers === job.assignedEngineers.length) {
        job.status = "Assigned";
      }
      user.jobHistory.push(job._id);
      await user.save();
      await job.save();
      return res.status(200).send("Engineer added to the job");
    } else {
      return res.status(400).send("Engineer required amount is full");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

//remove an engineer from a job
router.patch("/removeEngineer/:id", verify, async (req, res) => {
  try {
    console.log(req.body);
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) return res.status(404).send("Job does not exits");

    const engineer = await User.findOne({ _id: req.body.user });
    if (!engineer) return res.status(404).send("Engineer does not exits");

    //Removes the engineers from the array
    await Job.updateOne(
      { _id: req.params.id },
      { $pullAll: { assignedEngineers: [req.body.user] } }
    );
    job.status = "Pending";
    await job.save();

    //Removes the job from the engineer job history

    await User.updateOne(
      { _id: req.body.user },
      { $pullAll: { jobHistory: [req.params.id] } }
    );

    return res.status(200).send("Job was updated");
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

//delete a job
router.delete("/:id", async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) return res.status(404).send("Job does not exits");
    await job.remove();
    await User.updateMany({ $pullAll: { jobHistory: [req.params.id] } });
    return res.status(200).send("Job deleted");
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = router;
