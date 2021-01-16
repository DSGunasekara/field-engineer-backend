const express = require("express");
const connectDB = require("./database/db");
const cors = require("cors");

//routes
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const jobRoute = require("./routes/job");
const itemRoute = require('./routes/inventory')
const requestRoute = require('./routes/request')
// const engineerRoute = require("./routes/engineer");

const app = express();

//Database connection
//Use this function to connect to database always
connectDB().then(
  (res) => console.log("MongoDB Connected...."),
  (error) => console.log(error)
);

//Init middleware
app.use(cors());
app.use(express.json({ extended: false }));
app.use(express.static("./public"));

//change this to redirect requests to landing page
app.get("/", (req, res) => res.send("API Running"));

app.use("/api/user", userRoute);
app.use("/api/login", authRoute);
app.use("/api/job", jobRoute);
app.use("/api/inventory", itemRoute);
app.use('/api/request', requestRoute);
// app.use("/api/engineer", engineerRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
