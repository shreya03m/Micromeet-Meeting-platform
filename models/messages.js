// This is for mongodb database outlet 
const mongoose = require('mongoose');
const msgSchema = new mongoose.Schema({
    meeting_id:{
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    time:{
        type: String,
        required: true
    },
    date:{
        type: String,
        required: true
    }

})

const Msg = mongoose.model('left', msgSchema);
module.exports = Msg;