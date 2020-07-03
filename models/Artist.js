const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectID, ref: 'user'},
    website: {type: String},
    location: {type: String},
    status: {type: String},
    instruments: {type: [String]},
    biography: {type: String},
    bands: {type: [String]},
    influences: {type: [string]},
    education: [
        {
            school: {type: String, required: true},
            degree: {type: String, required: true},
            fieldofstudy: {type: String, required: true},
            from: {type: Date, required: true},
            to: {type: Date},
            current: {type: Boolean, default: false},
            description: {type: String}
        }
    ],  
    social: {
        youtube: {type: String},
        twitter: {type: String},
        facebook: {type: String},
        linkedin: {type: String},
        instagram: {type: String},
        bandcamp: {type: String}
    },
    date: {type: Date, default: Date.now}
});

module.exports = Profile = mongoose.model('Profile', ProfileSchema);