const express = require("express");
const bcrypt = require("bcrypt");
var nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
var jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/user.model");
const { CarModel } = require("../Models/cars.model");
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

userRouter.post('/booking', async (req, res) => {
    const payload = req.body
    const userId = payload.userId
    let data = {
        carId: payload.carId,
        total: payload.total,
        from: payload.from,
        to: payload.to,
        payment: payload.payment,
        total: payload.total
    }
    try {
        const user = await UserModel.find({ _id: userId })
        user[0].booking.push(data)
        await user[0].save()
        const car = await CarModel.find({ _id: data.carId })

        console.log(car)
        //transaction mail----------------------------------------------------------------------------------------------------
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sammyak.deosale.1@gmail.com',
                pass: "fyxhbljsixacflcp"
            }
        });

        var mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'RentalCar',
                link: 'https://RentalCar.js/'
            }
        });
        // // Next, generate an e-mail using the following code:

        var emailNew = {
            body: {
                name: user[0].username,
                intro: ['Congratulations ! You have rented a car!', 'We\'re very excited to have you on board.', 'So here are your booking details !', 'Have a nice day.'],
                table: {
                    data: [
                        {
                            Car: car[0].title,
                            Details: [`Type : ${(car[0].detailsitem, car[0].detailsitem2, car[0].detailsitem3)}`, `Date from : ${data.from}`, `Date to : ${data.to}`, `Payment Methd : ${data.payment}`, 'Payment Status : Pending'],
                            TotalFare: `₹${data.total}`,
                        }
                    ]
                },
                outro: "Happy Journey !"
            }

        };

        // Generate an HTML email with the provided contents
        var emailBody = mailGenerator.generate(emailNew);

        var mailOptions = {
            from: 'sammyak Deosale <sammyak.deosale.1@gmail.com>', // sender address
            to: user[0].email, // list of receivers
            subject: `Hello  here are your booking details `, // Subject line
            text: 'Booking Details ', // plaintext body
            html: emailBody// html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });

        await res.status(200).send({
            message: "done booking successfully",
        });




        //----------------------------------------------------------------------------------------------------------------


    } catch (err) {
        res.send(err)
    }
})

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
    const { username, email, password } = req.body;
    if (username && email && password) {
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
                            username,
                            email,
                            password: hash_password,
                            booking: Array
                        });
                        await newRegistration.save();
                        console.log(newRegistration);
                        //sending email--------------------------------------------------------
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'sammyak.deosale.1@gmail.com',
                                pass: "fyxhbljsixacflcp"
                            }
                        });

                        var mailGenerator = new Mailgen({
                            theme: 'default',
                            product: {
                                // Appears in header & footer of e-mails
                                name: 'RentalCar',
                                link: 'https://RentalCar.js/'
                                // Optional product logo
                                // logo: 'https://RentalCar.js/img/logo.png'
                            }
                        });
                        // Next, generate an e-mail using the following code:

                        var emailNew = {
                            body: {
                                name: username,
                                intro: ['Welcome to RentalCar!', 'We\'re very excited to have you on board.', 'Get started with login in with your current credentials!', 'Have a nice day.'],

                                outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
                            }
                        };

                        // Generate an HTML email with the provided contents
                        var emailBody = mailGenerator.generate(emailNew);

                        var mailOptions = {
                            from: 'sammyak Deosale <sammyak.deosale.1@gmail.com>', // sender address
                            to: email, // list of receivers
                            subject: `Hello ${email} `, // Subject line
                            text: 'Hello world ', // plaintext body
                            html: emailBody// html body
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
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
                            "token": token,
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