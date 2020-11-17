const fs = require('fs');
const path = require('path');


const  { validationResult} = require('express-validator/check');

const Post = require('../models/post');
const User = require('../models/user');


exports.getPosts = async (req, res, next) => {
    const currentPage =req.query.page || 1;
    const perPage = 2;
    let totalItems;
    try {
    const totalItems = await Post.find().countDocuments()
    const posts = await Post.find().skip((currentPage-1) * perPage).limit(perPage);
    
    res.status(200).json({message: 'Fetches posts', posts, totalItems})
    }
    catch(err){
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
};

exports.postPost = (req, res, next) => {
    const errors = validationResult(req);
    // console.log(errors)
    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed')
        error.statusCode = 422;
        throw error;
    }
    if(!req.file) {
        const error = new Error('No Image');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path.replace(/\\/g, '/');
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const post = new Post({
        title, 
        content, 
        creator: req.userId,
        imageUrl
    });
    post.save()
    .then(post => {
        return User.findById(req.userId);
    })
    .then(user => {
        creator = user;
        user.posts.push(post);
        return user.save();
    })
    .then(result => {
        res.status(201).json({
            message: 'Post created Sucessfully!',
            post:post,
            creator: { _id : creator._id, name: creator.name}
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}

exports.getPost = (req, res ,next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if(!post) {
            const error = new Error('Post not found!!');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message: 'Post getched', post:post});
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}

exports.putPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed')
        error.statusCode = 422;
        throw error;
    }
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl;
    if(req.file) {
        imageUrl = req.file.path.replace(/\\/g, '/');
    }

    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Post not found!!');
            error.statusCode = 404;
            throw error;
        }
        if(!imageUrl) {
            imageUrl = post.imageUrl
        }
        if(post.creator.toString() !== req.userId.toString()){
            const error = new Error('Access not authorized');
            error.statusCode = 403;
            throw error;
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save();
    })
    .then(result => {
        res.status(200).json({message: 'Post updated', post: result});
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}

exports.deletePost = (req, res, next) => {
    const id = req.params.postId;
    Post.findById(id)
    .then(post => {
        if(!post){
            const error = new Error('Post not found!!');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId.toString()){
            const error = new Error('Access not authorized');
            error.statusCode = 403;
            throw error;
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(id);
    })
    .then(result => {
        return User.findById(req.userId);
    })
    .then(user => {
        user.posts.pull(id);
        return user.save();
    })
    .then(result => {
        console.log(result);
        res.status(200).json({message: "Successful deletion"});
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        if(err) {
            console.log(err);
        }
    })
}