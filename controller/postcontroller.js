const express = require("express");
const user_model = require("../model/user");
const post_model = require('../model/post');
const comment_model = require("../model/comment");
const Joi = require("joi");
const like_model = require("../model/post_like");
const mongoose = require("mongoose");

const hit_post = async (req, res) => {
    return res.status(200).send("POST ROUTE HIT")
}

const create_post = async (req, res) => {
    console.log("Inside create Post")
    // console.log(req.user._id)
    try {
        const req_body = req.body;
        // console.log('req_body', req_body)
        const joi_object = {
            caption: Joi.string().min(1).max(200).optional(),
            post: Joi.string().optional()
        }
        const schema = Joi.object(joi_object);
        const { error, value } = schema.validate(req_body);
        if (error) {
            return res.status(422).json({ error: error })
        }


        console.log(req.file);
        const filetype = req.file.mimetype.split("/")[0];
        // console.log(typeof filetype)
        if (filetype === "image") {
            value.adType = "image"
            value.post = '/public/images/' + req.file.filename;
        }

        if (filetype === "video") {
            value.adType = "video"
            value.post = '/public/videos/' + req.file.filename;
        }
        // console.log(value)
        // console.log('value', value)
        const user_post = new post_model({ user_id: req.user._id, caption: value.caption, post: value.post, adType: value.adType})
        console.log(user_post)
        // return;
        const save_user_post = await user_post.save();
        // req.flash("success", "Post created successfully.");
        // return res.redirect("/fetch_create_post_page");
        return res.status(201).json({ "created_post": save_user_post });
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

const create_comment = async (req, res) => {
    try {
        const req_body = req.body;
        const post_id = req.query.post_id
        console.log("req body", req_body)
        const schema = Joi.object({
            comment: Joi.string().min(1).max(250).required(),
            // user_id: Joi.string().required()
        })
        const { error, value } = schema.validate(req_body);
        if (error) {
            return res.status(201).json({ error: error.details[0].message });
        }
        const user_comment = new comment_model({ comment: value.comment, post_id: post_id, user_id: req.user._id });
        const save_user_comment = await user_comment.save();
        if (save_user_comment) {
            console.log(save_user_comment);
            console.log(save_user_comment._id)

            const post = await post_model.findById({ _id: post_id });
            console.log(post)
            post.comment_id.push(save_user_comment._id)
            await post.save();
        }
        return res.status(201).json({ created_comment: save_user_comment });
        // return res.render("post")
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

const create_like = async (req, res) => {
    console.log('like route hit');
    try {
        const req_body = req.body;
        const post_id = req.query.post_id;
        // const joi_object = {
        //     // user_id: Joi.string().required(),
        //     post_id: Joi.string().required()
        // }
        // const schema = Joi.object(joi_object);
        // const { error, value } = schema.validate(req_body);
        // if (error) {
        //     return res.status(422).json({ error: error });
        // }

        // const existing_like = await like_model.findOne({where:{user_id: req.user._id}});

        const existing_like = await like_model.findOne({ user_id: req.user._id, post_id: req.query.post_id })

        // const existing_like = await like_model.findOne({
        //     and: [
        //         { where: { user_id: req.user._id } },
        //         { where: { post_id: post_id } }
        //     ]
        // })

        console.log("req.user._id", req.user._id);

        console.log("existing_like", existing_like);

        if (existing_like) {
            console.log('found the Like');
            console.log('existng like', existing_like);
            // console.log('post**********again', post)
            const post = await post_model.findById({ _id: post_id });
            post.like_id.pull(existing_like._id);
            await post.save();
            const destroy_like = await like_model.deleteOne(
                { user_id: req.user._id, post_id: req.query.post_id }
            )
            console.log('destroyed_like', destroy_like);
            return res.status(200).json({ destroy_like });
        }


        console.log('Did not found the Like');
        // return;

        const like = new like_model({ user_id: req.user._id, post_id: post_id });
        const created_like = await like.save();
        if (created_like) {
            console.log(created_like);
            const post = await post_model.findById({ _id: post_id });
            console.log(post)
            post.like_id.push(created_like._id);
            await post.save();
            return res.status(201).json({ created_like });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
}

const fetch_post_comment = async (req, res) => {
    // console.log("Router Hit")

    try {
        const req_body = req.body;
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const post_id = req.query.post_id;
        // const joi_object = {
        //     post_id: Joi.string().required()
        // }

        // const schema = Joi.object(joi_object);
        // const { error, value } = schema.validate(req_body);

        // if (error) {
        //     return res.status(422).json({ error: error });
        // }

        const fetch_comments = await comment_model
            .find({ post_id: post_id })
            .populate("user_id", "username user_pic")
            .skip((parseInt(page) - 1) * limit)
            .limit(limit)
            .sort({ "_id": -1 })

        const comment_count = await comment_model.find({ post_id: post_id }).count();


        // return res.status(200).json({ comments: fetch_comments, comment_count, page, limit });
        return res.render("comment", { comments: fetch_comments, comment_count, page, limit });
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

const fetch_post_likes = async (req, res) => {
    try {
        const req_body = req.body;
        const page = req.query.page || 1;
        const limit = req.query.limit || 3;
        const post_id = req.query.post_id;

        // const joi_object = {
        //     post_id: Joi.string().required()
        // }

        // const schema = Joi.object(joi_object);
        // const { error, value } = schema.validate(req_body);

        // if (error) {
        //     return res.status(422).json({ error: error });
        // }

        const post_likes = await like_model.find({ post_id: post_id })
            .populate('user_id', 'username user_pic')
            .skip((page - 1) * limit)
            .limit(limit);

        const post_likes_count = await like_model.find({ post_id: post_id }).countDocuments();

        // return res.status(200).json({ post_likes_count, post_likes_count })
        return res.render('like', { post_likes, post_likes_count, page, limit });
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

const fetch_all_posts = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;

        // if you want to find the posts of specific user
        const user_id = req.query.user_id;
        const filter = {};
        if (user_id) {
            filter['user_id'] = user_id;
        }

        const post = await post_model
            .find(filter)
              // .select(['caption','user_id','comment_id'])
            .skip((parseInt(page - 1)) * limit)
            .limit(limit);

        return res.status(200).json({ allPosts: post });
    } catch (error) {
        return res.status(500).send(error);
    }
}

const delete_post = async (req, res) => {
    try {
        const post_id = req.params.id;
        console.log(post_id)
        const find_post = await post_model.findById({ _id: post_id });
        // console.log(find_post)
        if (find_post.user_id != req.user._id) {
            return res.status(200).json({ error: "This user is not authorized to delete the post" });
        }
        const delete_post = await post_model.findByIdAndDelete({ _id: post_id })
        console.log(delete_post);
        return res.status(200).json({ post_deleted: delete_post });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
}

const delete_comment = async (req, res) => {
    // console.log("delete route", req.params['_id'])
    try {
        const comment_id = req.params["id"];
        const post_id = req.params["post_id"];
        console.log("comment_id", comment_id);
        console.log("post_id", post_id)

        const delete_comment = await comment_model.findByIdAndDelete({ _id: comment_id })
        console.log(delete_comment);
        const find_post = await post_model.findById({ _id: post_id })
        console.log('find_post', find_post);
        if (find_post) {
            find_post.comment_id.pull(delete_comment._id)
            await find_post.save();
        }
        return res.status(200).json({ delete_comment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
}

const edit_comment = async (req, res) => {
    console.log("router hit")
    try {
        const comment_id = req.query.comment_id;
        const req_body = req.body;

        const schema = Joi.object({
            comment: Joi.string().required()
        })
        const { error, value } = schema.validate(req_body);
        if (error) {
            return res.status(201).json({ error: error.details[0].message });
        }


        const update_comment = await comment_model.findByIdAndUpdate({ _id: comment_id }, { comment: value.comment }, { new: true });

        console.log(update_comment);
        return res.status(200).json({ update_comment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}

const fetch_post_data = async (req, res) => {
    console.log('fetch_post_data')
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const post = await post_model
            .find()
            // .select(['caption','user_id','comment_id'])
            .populate("user_id", "username email user_pic")
            .populate({
                path: "child_count_for_like",
                // populate: ["user_id"],
            })
            .populate({
                path: "child_count_for_comment",
                // populate: ["user_id"]
            })
            .populate({
                path:"like_id"
            })
            .populate({
                path:'comment_id',
                options: {
                    sort:{ _id:'-1' },
                    limit : 3
                },
            })
            .skip((parseInt(page - 1)) * limit)
            .limit(limit);

        // console.log('hello 1', JSON.stringify(post)); // Doesn't include `childCount`

        // Can also set `virtuals: true` globally
        mongoose.set('toJSON', { virtuals: true });
        // console.log('hello 3', JSON.stringify(post)); // Includes `childCount` because of global option

        console.log(post)
        return res.render('post', { post })
        // return res.status(200).json({ post });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error })
    }
}

const fetch_create_post_page = (req, res) => {
    try {
        req.flash("success", "Post created successfully.");

        return res.render("createpost")
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error })
    }
}

const render_edit_comment = async (req, res) => {
    try {
        // const user = req.user._id
        const comment_id = req.query.comment_id;
        const found_comment = await comment_model.findById({ _id: comment_id });
        console.log(found_comment);
        return res.render('edit_comment_page', { comment_id, found_comment });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}

module.exports = { create_post, hit_post, create_comment, create_like, fetch_post_comment, fetch_all_posts, fetch_post_likes, delete_post, delete_comment, edit_comment, fetch_post_data, fetch_create_post_page, render_edit_comment };