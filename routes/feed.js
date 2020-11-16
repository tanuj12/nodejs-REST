const express = require('express');
const { check} = require('express-validator/check');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/posts',isAuth, feedController.getPosts);

router.post('/post',isAuth, [
    check('title').trim().isLength({min: 5}),
    check('content').trim().isLength({min: 5}),
] ,feedController.postPost);

router.get('/post/:postId',feedController.getPost);

router.put('/post/:postId',isAuth, [
    check('title').trim().isLength({min: 5}),
    check('content').trim().isLength({min: 5}),
], feedController.putPost);

router.delete('/post/:postId',isAuth,feedController.deletePost);

module.exports = router;