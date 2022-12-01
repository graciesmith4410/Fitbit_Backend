const {model, Schema} = require('mongoose');

const UserSchema = new Schema ({
    userName: {
        type: String,
        required: true
    },
    access_token: {
        type: String,
        required: true
    },
    expires_in: {
        type: Number,
        required: true
    },
    refresh_token: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        required: true
    },
    }, {
        timestamps: ['createdAt'],
    }
);
const User = model('User', UserSchema);
module.exports =  User;