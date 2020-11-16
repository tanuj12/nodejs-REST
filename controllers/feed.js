const fs = require('fs');
const path = require('path');


const  { validationResult} = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post.find()
    .then(posts => {
        res.status(200).json({message: 'Fetches posts', posts})
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
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
    const post = new Post({title, content, creator: {
        name:'sadasdasd',
    },
    imageUrl: imageUrl});

    post.save()
    .then(post => {
        console.log(post)
        res.status(201).json({
            message: 'Post created Sucessfully!',
            post:post
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

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        if(err) {
            console.log(err);
        }
    })
}