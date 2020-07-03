const User = require('../../models/User');

const express = require('express'),
router        = express.Router(),
{check, validationResult, body} = require('express-validator');

// Models
const User = require('../../models/User'),
Post       = require('../../models/Post'),
Artist     = require('../../models/Artist');

// ====================================================================== Getting Posts and Post

// @route       GET api/posts
// @description Retrieve all posts
// @access      Public
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator');
    }
});

// @route       GET api/posts/:id
// @description Retrieve post by ID
// @access      Public
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.json(post);

        if(!post){
            res.status(404).json({msg: 'Post not found'});
        }
    }
    catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectID') {
            res.status(404).json({msg: 'Post not found'});
        }
        res.status(500).send('Server error, please contact server administrator');
    }
});

// ====================================================================== Create and Delete Posts

// @route       POST api/posts
// @description Create a new post
// @access      Private
router.post('/', [auth, [
    check('text', 'Please input text for the post').not().isEmpty()
]], async (req, res) => {
    const errors = validationReqult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).isSelected('-password');

        const newPost = new Post({
            text: req.body.text,
            user: req.user.id,
            name: user.name,
            avatar: user.avatar
        })

        const post = await newPost.save();

        res.json(post);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator');
    }
});

// @route       DELETE api/posts/:id
// @description Remove post by id
// @access      Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        // Confirm user is owner of post
        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'Error, user not authorized'});
        }

        if(!post){
            res.status(404).json({msg: 'Post not found'});
        }

        await post.remove();        
        res.json({msg: 'Post has been removed'});
    }
    catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectID') {
            res.status(404).json({msg: 'Post not found'});
        }
        res.status(500).send('Server error, please contact server administrator');
    }
});

// ====================================================================== Likes and Dislikes

// @route       PUT api/posts/like/:id
// @description Add like to a post
// @access      Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if post already liked by current user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg: 'You can only like a post once'});
        }

        post.likes.unshift({user: req.user.id});

        await post.save();

        res.json(post.likes);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator');
    }
});

// @route       PUT api/posts/unlike/:id
// @description Remove like from a post
// @access      Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if post already liked by current user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length = 0){
            return res.status(400).json({msg: 'You have not liked this post'});
        }

        // Get remove like index
        const removeLike = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeLike, 1);

        await post.save();

        res.json(post.likes);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator');
    }
});

// ====================================================================== Add and Remove Comments

// @route       POST api/posts/comment/:id
// @description Create a new comment
// @access      Private
router.post('/', [auth, [
    check('text', 'Please input text for the comment').not().isEmpty()
]], async (req, res) => {
    const errors = validationReqult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).isSelected('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            user: req.user.id,
            name: user.name,
            avatar: user.avatar
        };

        post.comments.unshift(newComment);

        await post.save();

        res.json(post.comments);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator');
    }
});

// @route       DELETE api/posts/comment/:id/:comment_id
// @description Remove a comment
// @access      Private
router.delete('api/posts/comment/:id/:comment_id', auth, async (res, req) => {
    try {
        const post = await Post.findById(req.params.id);
        
        // Retreive comment from post
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        // Confirm comment extsts
        if(!comment){
            return res.status(404).json({msg: 'Comment not found'})
        }

        // Confirm user made comment
        if(comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'Error, user not authorized'});
        }

        // Get remove comment index
        const removeComment = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeComment, 1);

        await post.save();

        res.json(post.comments);

    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator');
    }
});

module.exports = router;