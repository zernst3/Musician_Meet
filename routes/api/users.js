const express = require('express'),
router        = express.Router(),
gravatar      = require('gravatar'),
bcrypt        = require('bcryptjs'),
jwt           = require('jsonwebtoken'),
config        = require('config'),
{check, validationResult} = require('express-validator');

// User Model
const User = require('../../models/User');


// @route       GET api/users
// @description Test Route
// @access      Public
router.get('/', (req, res) => {
    res.send("User Route")
});

// @route       POST api/users
// @description Register User
// @access      Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email address').isEmail(),
    check('password', 'Password must contain at least 6 characters').isLength({min: 6})
], async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
    // Confirm user does not already exist
    let user = await User.findOne({email});
    if (user){
        return res.status(400).json({errors: [{msg: 'User already exists'}]});
    }
    
    // Retreieve user's gravatar
    const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
    });

    user = new User({
        name,
        email,
        avatar,
        password
    });

    // Encrypt entered password
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    // Save user to the database
    await user.save();

    // json web token
    const payload = {
        user: {
            id: user.id
        }
    }

    jwt.sign(payload, config.get('jwtSecret'), {
        expiresIn: 3600
    }, (error, token) => {
        if (error){
            throw error;
        } 
        res.json({token});
    });

    }
    catch (error){
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator');
    }

    console.log(req.body);
});

module.exports = router;

