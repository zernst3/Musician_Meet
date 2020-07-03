const express = require('express'),
router        = express.Router(),
auth          = require('../../middleware/authorization'),
jwt           = require('jsonwebtoken'),
config        = require('config'),
bcrypt        = require('bcryptjs'),
{check, validationResult} = require('express-validator');

// User Model
const User = require('../../models/User');

// @route       GET api/authorization
// @description Test Route
// @access      Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch (error){
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator');
    }
});

// @route       POST api/authorization
// @description Authenticate user and retrieve token
// @access      Public
router.post('/', [
    check('email', 'Please enter a valid email address').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    try {
        // Confirm user does not already exist
        let user = await User.findOne({email});
        if (!user){
            return res.status(400).json({errors: [{msg: 'Entered credentials are invalid'}]});
        }

        const match = await bcrypt.compare(password, user.password);

        if(!match){
            return res.status(400).json({errors: [{msg: 'Entered credentials are invalid'}]});
        }

        // json web token
        const payload = {user: {id: user.id}}

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
});

module.exports = router;