const express = require("express");
const bcrypt = require("bcrypt");
var nodemailer = require('nodemailer');
var jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/user.model");
const userRouter = express.Router();
require("dotenv").config();

userRouter.get("/", async (req, res) => {
    const query = req.query._limit;
    const pages = req.query._page;
    try {
        const users = await UserModel.find()
            .limit(query)
            .skip((pages - 1) * query);

        res.status(200).send(users);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

userRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const users = await UserModel.find({ _id: id });
        res.status(200).send(users);
    } catch (err) {
        res.status(400).send(err.message);
    }
});


userRouter.post("/register", async (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        const validateEmail = await UserModel.findOne({ email: email });
        if (validateEmail) {
            res.send({
                message: "already registred user Please Login",
                userId: validateEmail._id,
            });
        } else {
            try {
                bcrypt.hash(password, 10, async (err, hash_password) => {
                    if (err) {
                        res.send({
                            message: err.message,
                        });
                    } else {
                        const newRegistration = new UserModel({
                            email,
                            password: hash_password,
                        });
                        await newRegistration.save();
                        console.log(newRegistration);
            //sending email--------------------------------------------------------
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'sammyak.deosale.1@gmail.com',
                    pass: process.env.googlePass
                }
            });
            
            // NB! No need to recreate the transporter object. You can use
            // the same transporter object for all e-mails
            
            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: 'sammyak Deosale <sammyak.deosale.1@gmail.com>', // sender address
                to: email, // list of receivers
                subject: `Hello ${email} `, // Subject line
                text: 'Hello world ', // plaintext body
                html: '<b>Hello world </b>'// html body
            };
            
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }else{
                    console.log('Message sent: ' + info.response);
                }
            });

                        await res.status(200).send({
                            message: "new registration successfully",
                        });
                    }
                });
            } catch (err) {
                res.status(400).send({
                    message: err.message,
                });
            }
        }
    } else {
        res.send({
            message: "Please fill the required fields",
        });
    }
});

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        try {
            const user = await UserModel.find({ email });
            if (user.length > 0) {
                bcrypt.compare(password, user[0].password, (err, result) => {
                    if (result) {
                        const token = jwt.sign({ userId: user[0]._id }, "masai");
                        console.log(user);
                        res.status(200).send({
                            userId: user[0]._id,
                            message: "Login successfully",
                            "token":token,
                        });
                    } else {
                        res.status(400).send({
                            message: "Wrong Password",
                        });
                    }
                });
            } else {
                res.send({
                    message: "Email Address not found",
                });
            }
        } catch (err) {
            res.send({
                message: err.message,
            });
        }
    } else {
        res.send({
            message: "Please fill the required fields",
        });
    }
});

userRouter.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await UserModel.findByIdAndDelete({ _id: id });
        res.status(200).send("user deleted !");
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = {
    userRouter,
};