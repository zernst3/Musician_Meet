const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    username: {type: String},
    date: {type: Date, default: Date.now},
    text: {type: String, required: true},
    title: {type: String},
    likes: [{user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}}],
    comments: [
        {
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}, 
            text: {type: String, required: true},
            username: {type: String},
            date: {type: Date, default: Date.now}
        }
    ]
});

module.exports = Post = mongoose.model('Post', PostSchema);