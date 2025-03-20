const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const taskSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() },
    user_id: { type: String, required: true },
    task_name: { type: String, required: true },
    status: { type: String, default: 'pending' },
    priority: { type: Number, default: 3 },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
