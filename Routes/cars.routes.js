const express = require("express");
const { authenticate } = require("../Middleware/authentication");
const { CarModel } = require("../Models/cars.model");
const carRouter = express.Router();

carRouter.get("/", async (req, res) => {
    const query = req.query._limit;
    const pages = req.query._page;
    try {
        const cars = await CarModel.find()
            .limit(query)
            .skip((pages - 1) * query);
            res.status(200).send(cars);
    } catch (err) {
        res.status(400).send(err.message);
    }
});
carRouter.get("/state", async (req, res) => {
    const {state,city} = req.body;
    const payload={};
    state&&(payload.state=state)
    city &&(payload.city=city)
    try {
        const cars = await CarModel.find(payload)
        res.status(200).send(cars);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

carRouter.use(authenticate)

carRouter.get("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const cars = await CarModel.find({ _id: id });
        res.send(cars).status(200);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

carRouter.post("/addjson", async (req, res) => {
    const payload = req.body;
    try {
      await CarModel.insertMany(payload);
      res.status(200).send("car json added !");
    } catch (err) {
        res.status(400).send(err);
    }
  });

carRouter.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await CarModel.findByIdAndDelete({ _id: id });
        res.status(200).send("car deleted !");
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = {
    carRouter,
};