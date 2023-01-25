const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const user_model = require("../model/user");
var session = require('express-session')
const jwt = require("jsonwebtoken");


const greet = async (req, res) => {
    try {
        // console.log(req.user._id)
        return res.render('index')
        // return res.status(200).json({greet:"Hello"});

    } catch (error) {
        console.log(error);
    }
}

const home_page = async (req, res) => {
    try {
        console.log(req.session.user)
        return res.render("home_page")

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error })
    }
}

const sign_up_page = (req, res) => {
    try {
        return res.render("signup")
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error })
    }
}

const sign_up = async (req, res) => {

    try {
        console.log("************REQUESTED FILE************", req.file)
        // const {username, email, password, confirm_password, contact, is_active, user_pic, country} = req.body;
        const req_body = req.body;

        const emailExist = await user_model.findOne({ email: req_body.email });

        if (emailExist) {
            req.flash("error", "Email already existes")
            return res.status(400).json({ error: "Email Aready Exists" })
        }

        const joi_object = {
            username: Joi.string().trim().max(50).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(4).max(8).required(),
            confirm_password: Joi.any().valid(Joi.ref("password")).required(),
            is_active: Joi.boolean().optional(),
            contact: Joi.string().trim().max(12).required(),
            country: Joi.string().trim().max(50).required(),
            token: Joi.string().optional()
        };

        const schema = Joi.object(joi_object);
        const { error, value } = schema.validate(req_body);
        if (error) {
            req.flash("error", error.details[0].message);
            return res.redirect("back")
            // return res.status(402).json({ error: error.details[0].message });
        }

        const hashPassword = await bcrypt.hash(value.password, 10);

        value.password = hashPassword;

        if (req.file) value.user_pic = '/public/images/' + req.file.filename;


        console.log("****************After hashing VALUE*******************");
        console.log(value);

        const user = new user_model(value);
        const token = await jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' })
        user.token = token
        const new_user = await user.save();
        // console.log(new_user);
        req.session.user = new_user;
        return res.redirect("/fetch_post_data");
        // return res.status(201).json({ user_created_successfully: new_user });

    } catch (error) {
        console.log('error in catch', error);
        return res.status(500).json({ error });
    }

}

const login = async (req, res) => {
    try {
        const req_body = req.body;
        const joi_object = {
            email: Joi.string().email().required(),
            password: Joi.string().required()
        }
        const schema = Joi.object(joi_object);
        const { error, value } = schema.validate(req_body);
        if (error) {
            req.flash("formValue", req_body);
            req.flash("error", error.details[0].message)
            return res.redirect("back")
            // return res.status(402).json({ error: error.details[0].message });
        }
        const userFound = await user_model.findOne({ email: value.email });

        if (!userFound) {
            console.log("Email does not exist");
            req.flash("formValue", req_body);
            req.flash("error", "Invalid Credentials!!!");
            return res.redirect("back")
            // return res.status(422).json({ error: "Email does not exist" });
        }
        const compare_password = await bcrypt.compare(value.password, userFound.password);
        if (!compare_password) {
            console.log("Password does not match")
            req.flash("formValue", req_body);
            req.flash("error", "Invalid Credentials!!!");
            return res.redirect("back")
            // return res.status(402).json({ error: "Password does not match" });
        }
        const token = jwt.sign({ _id: userFound._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        userFound.token = token
        await userFound.save();
        req.session.user = userFound;
        return res.redirect("/fetch_post_data");
        // return res.status(200).json({ 'successfully logged in': userFound })
        // return res.render("index")
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}

const profile = async (req, res) => {
    try {
        return res.render('profile');
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
}

const all_users = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;

        const users = await user_model.find({ _id: { $ne: req.user._id }})
            .skip((parseInt(page) - 1) * limit)
            .limit(limit)
            .sort({"_id": -1})
        return res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}

const logout = async (req, res) => {
    try {
        console.log('session undestroyed', req.session)
        req.session.destroy((error) => {
            if (error) {
                return res.status(500).json({ error: error });
            }
            console.log('session destroyed', req.session)
            res.redirect('/') // will always fire after session is destroyed
        })
    } catch (error) {
        console.log('error from logout catch', error);
        return res.status(500).json({ error: error });
    }
}

module.exports = { greet, sign_up, home_page, login, sign_up_page, all_users, profile, logout };