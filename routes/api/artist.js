const express = require('express'),
router        = express.Router(),
auth          = require('../../middleware/authorization'),
request       = require('request'),
config        = require('config'),
{check, validationResult} = require('express-validator');

// Artist Model
const Artist = require('../../models/Artist'),
User          = require('../../models/User');

// @route       GET api/artists
// @description Get all artists
// @access      Public
router.get('/', async (req, res) => {
    try {
        const artists = await Artist.find().populate('user', ['name', 'avatar']);
        res.json(artists);
    }
    catch (error){
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator')
    }
});

// @route       GET api/artist/user/:user_id
// @description Get artist by user ID
// @access      Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const artist = await Artist.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if(!artist){
            return res.status(400).json({
                msg: "No artist profile exists for this user"
            });
        }
        res.json(artist);
    }
    catch (error){
        console.error(error.message);
        // if(error.kind == 'ObjectId') {
        //     return res.status(400).json({
        //         msg: "No artist profile exists for this user"
        //     });
        // }
        res.status(500).send('Server error, please contact server administrator')
    }
});

// @route       GET api/profile/me
// @description Retreieve current user's artist profile
// @access      Private
router.get('/me', auth, async (req, res) => {
    try {
        const artist = await Artist.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);

        if(!artist) {
            return res.status(400).json({
                msg: "No artist profile exists for this user"
            });
        }
        res.json(artist);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator');
    }
});

// @route       POST api/artist
// @description Create or update artist profile
// @access      Private
router.post('/', auth, async (req, res) => {
    const retrievedArtist = req.body;

    // Create artist objects
    const artistFields = {};
    artistFields.user = req.user.id;
    if(retrievedArtist.website) {artistFields.website = website;}
    if(retrievedArtist.location) {artistFields.location = location;}
    if(retrievedArtist.status) {artistFields.status = status;}
    if(retrievedArtist.biography) {artistFields.bio = bio;}
    if(retrievedArtist.bands) {
        artistFields.bands = retrievedArtist.bands.split(',').map(band => band.trim());
    }
    if(retrievedArtist.instruments) {
        artistFields.instruments = retrievedArtist.instruments.split(',').map(instrument => instrument.trim());
    }

    // Create social object
    artistFields.social = {};
    if(retrievedArtist.youtube) {artistFields.social.youtube = youtube;}
    if(retrievedArtist.twitter) {artistFields.social.twitter = twitter;}
    if(retrievedArtist.instagram) {artistFields.social.instagram = instagram;}
    if(retrievedArtist.linkedin) {artistFields.social.linkedin = linkedin;}
    if(retrievedArtist.facebook) {artistFields.social.facebook = facebook;}

    try {
        let artist = await Artist.findOne({user: req.user.id});

        if(artist) {
            // Update the artist
            artist = await Artist.findOneAndUpdate({user: req.user.id}, {$set: artistFields}, {new: true});

            return res.json(artist);
        }

        // Create the artist
        artist = new Artist(artistFields);
        await artist.save();
        res.json(artist);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator')
    }
});

// @route       DELETE api/artist
// @description Delete artist, user & any related posts
// @access      Private
router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove user posts
        // Delete Artist
        await Artist.findOneAndRemove({user: req.user.id});

        // Delete User Account
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg: 'User deleted'});
    }
    catch (error){
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator')
    }
});

// @route       PUT api/artist/education
// @description Add artist education
// @access      Private
router.put('/education', [auth, [
    check('school', 'Your school is required').not().isEmpty(),
    check('degree', 'Your degree is required').not().isEmpty(),
    check('fieldofstudy', 'Your field of study is required').not().isEmpty(),
    check('from', 'The "from" date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {school, degree, fieldofstudy, from, to, current, description} = req.body;

    const education = {school, degree, fieldofstudy, from, to, current, description};

    try {
        // Find the artist
        const artist = await Artist.findOne({user: req.user.id});
        // Add education to experience array
        artist.education.unshift(education);
        await artist.save();

        res.json(artist);
    }
    catch (error){
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator')
    }
});

// ADD UPDATE FOR THE EDUCATION

// @route       DELETE api/artist/education/:education_id
// @description Delete education from artist
// @access      Private
router.delete('/education/:education_id', auth, async (req, res) => {
    try {
        const artist = await Artist.findOne({user: req.user.id});

        // Retrieve remove Education
        const removeEducation = artist.education.map(item => item.id).indexOf(req.params.education_id);
        // Remove the education from the array
        artist.education.splice(removeEducation, 1);
        await artist.save();

        res.json(artist);
    }
    catch (error){
        console.error(error.message);
        res.status(500).send('Server error, please contact server administrator')
    }
});

module.exports = router;