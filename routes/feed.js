const express = require('express');
const { check} = require('express-validator/check');

const feedController = require('../controllers/feed');

const router = express.Router();

router.get('/posts', feedController.getPosts);

router.post('/post', [
    check('title').trim().isLength({min: 5}),
    check('content').trim().isLength({min: 5}),
] ,feedController.postPost);

router.get('/post/:postId',feedController.getPost);

module.exports = router;