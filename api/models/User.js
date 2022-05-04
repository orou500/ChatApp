const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    googleId: {
        type: String,
    },
},
{
    timestamps: true,
}
)

const User = mongoose.model('user', userSchema)
module.exports = User