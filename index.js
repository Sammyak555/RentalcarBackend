const express = require("express");
const { connection } = require("./Config/db");
const { userRouter } = require("./Routes/users.routes");
const { carRouter } = require("./Routes/cars.routes");

require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(cors());

app.use(express.json());
app.use("/users", userRouter);
// app.use(authenticate)
app.use("/cars", carRouter);

app.get("/", (req, res) => {
  res.send("welcome to the rentalcar backend project")
})
app.listen(process.env.port, async (req, res) => {
  try {
    
    await connection;
    console.log("Connected to db");
  } catch (err) {
    console.log(err);
  }
  console.log(`Running on port ${process.env.port}`);

});