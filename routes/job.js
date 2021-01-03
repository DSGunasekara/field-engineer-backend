const router = require("express").Router();
const Job = require("../models/Job");
const User = require("../models/User");
const upload = require("../middleware/images");
const auth = require("../middleware/verify");

//get all jobs
router.get("/", async (req, res) => {
  try {
    await Job.find({})
      .populate("assignedEngineers")
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
router.get("/:id", async (req, res) => {
  try {
    await Job.findOne({ _id: req.params.id })
      .populate("assignedEngineers")
      .exec()
      .then((job, error) => {
        if (error) return res.status(400).send(error);
        return res.status(200).send(job);
      });
  } catch (error) {
    return res.status(500).send(error);
  }
});

//post a job
router.post("/", async (req, res) => {
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
router.patch("/:id", async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) return res.status(404).send("Job does not exits");
    if (job.requiredEngineers <= job.assignedEngineers.length)
      await Job.updateOne({ _id: req.params.id }, req.body);
    //TODO: update engineer job list history
    return res.status(200).send("Job updated");
  } catch (error) {
    return res.status(500).send(error);
  }
});

//upload images
router.patch(
  "/upload/image",
  auth,
  upload.single("jobImg"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).send("User does not exits");
      console.log(user._id);
      const engineer = await Engineer.findOne({ user: user._id }); //FIX
      if (!engineer) return res.status(404).send("Engineer does not exits");

      return res.status(200).send(engineer);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }
);

//add a engineer to the job
router.patch("/addEngineer/:id", async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) {
      console.log("job");
      return res.status(404).send("Job does not exits");
    }

    const user = await User.findOne({ _id: req.body.engineer });
    if (!user) {
      console.log("user");
      return res.status(404).send("No user found");
    }

    const engineer = await Engineer.findOne({ user: user._id }); //FIX
    if (!engineer) {
      console.log("engineer");
      return res.status(404).send("Engineer does not exits");
    }

    const jobDate = job.date.toISOString().substr(0, 10);
    const endDate = new Date(jobDate);
    let day = jobDate.substr(8, 10);
    console.log(day);
    endDate.setDate(parseInt(day) + 1);
    console.log(jobDate);
    console.log(endDate);

    const jobList = await Job.find({
      assignedEngineers: engineer,
      date: { $gte: jobDate, $lt: endDate.toISOString().substr(0, 10) },
    });
    console.log(jobList);
    if (jobList.length !== 0) {
      console.log(jobList.length);
      return res.status(409).send("Engineer job date conflict");
    }

    if (engineer.availability === false)
      return res
        .status(400)
        .send("Engineer availability is set to unavailable");

    const checkEngineer = await Job.findOne({
      assignedEngineers: req.body.engineer,
    });
    if (checkEngineer) return res.status(409).send("Engineer already assigned");

    if (job.requiredEngineers > job.assignedEngineers.length) {
      console.log(engineer);
      const engineerId = engineer._id;
      job.assignedEngineers.push(engineerId);
      if (job.requiredEngineers === job.assignedEngineers.length) {
        job.status = "Assigned";
      }
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
router.patch("/removeEngineer/:id", async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id });
    if (!job) return res.status(404).send("Job does not exits");

    const engineer = await Engineer.findOne({ _id: req.body.engineer }); //FIX
    if (!engineer) return res.status(404).send("Engineer does not exits");

    //Removes the engineers from the array
    await Job.updateOne(
      { _id: req.params.id },
      { $pullAll: { assignedEngineers: [req.body.engineer] } }
    );
    job.status = "Pending";
    await job.save();

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
    await job.remove(async (error, _) => {
      if (error) return res.status(400).send(error);

      return res.status(200).send("Job deleted");
    });
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = router;
