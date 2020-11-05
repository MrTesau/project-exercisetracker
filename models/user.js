const mongoose = require('mongoose');
const shortid = require('shortid');
//pull out schema
const { Schema } = mongoose;
// exerciseSession
/*
const sessionSchema = new Schema({
  description: String,
  duration: Number,
  date:{ type: Date, default:  new Date() }  
},{ timestamps: true });
*/
const userSchema = new Schema({
    username: String,
    _id: {
  'type': String,
  'default': shortid.generate
},exercises: [
    {
      description: String, 
      duration: Number,
      date: Date
    }
]
}, { timestamps: true });

const UserEntry = mongoose.model('UserEntry', userSchema );
module.exports = UserEntry;