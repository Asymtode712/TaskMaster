const mongoose = require('mongoose');

const taskDetailsSchema = new mongoose.Schema({
    task_id: { type: String, required: true, unique: true },
    description: String,
    start_datetime: Date,
    end_datetime: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TaskDetails', taskDetailsSchema);