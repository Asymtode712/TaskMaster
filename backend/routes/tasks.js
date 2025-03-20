const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Task = require('../models/Task');
const TaskDetails = require('../models/TaskDetails');

router.post('/', authenticateToken, async (req, res) => {
    const { task_name, priority = 3 } = req.body;
    
    try {
        const task = new Task({
            user_id: req.user.id,
            task_name,
            priority
        });
        
        await task.save();
        res.status(201).json({ message: 'Task created successfully', id: task._id });
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ error: 'Error creating task' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ user_id: req.user.id });
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { task_name, priority } = req.body;
    
    try {
        const task = await Task.findOneAndUpdate(
            { _id: id, user_id: req.user.id },
            { task_name, priority },
            { new: true }
        );
        
        if (!task) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }
        
        res.json({ message: 'Task updated successfully' });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Error updating task' });
    }
});

router.put('/:id/complete', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        await Task.findByIdAndUpdate(id, { status: 'completed' });
        res.json({ message: 'Task marked as completed' });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Error updating task' });
    }
});

router.delete('/completed', authenticateToken, async (req, res) => {
    try {
        const result = await Task.deleteMany({ status: 'completed' });
        
        if (result.deletedCount === 0) {
            return res.json({ message: 'No completed tasks to delete' });
        }
        
        res.json({ message: 'Completed tasks deleted successfully' });
    } catch (err) {
        console.error('Error deleting completed tasks:', err);
        res.status(500).json({ error: 'Error deleting completed tasks' });
    }
});

router.post('/:id/details', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { description, start_datetime, end_datetime } = req.body;
    
    try {
        const taskDetails = new TaskDetails({
            task_id: id,
            description,
            start_datetime: new Date(start_datetime),
            end_datetime: new Date(end_datetime)
        });
        
        await taskDetails.save();
        res.status(201).json({ message: 'Task details added successfully' });
    } catch (err) {
        console.error('Error adding task details:', err);
        res.status(500).json({ error: 'Error adding task details' });
    }
});

router.get('/:id/details', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        const details = await TaskDetails.findOne({ task_id: id });
        if (!details) {
            return res.status(404).json({ error: 'Task details not found' });
        }
        res.json(details);
    } catch (err) {
        console.error('Error fetching task details:', err);
        res.status(500).json({ error: 'Error fetching task details' });
    }
});

router.put('/:id/details', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { description, start_datetime, end_datetime } = req.body;
    
    try {
        const details = await TaskDetails.findOneAndUpdate(
            { task_id: id },
            {
                description,
                start_datetime: new Date(start_datetime),
                end_datetime: new Date(end_datetime),
                updated_at: new Date()
            },
            { new: true }
        );
        
        if (!details) {
            return res.status(404).json({ error: 'Task details not found' });
        }
        
        res.json({ message: 'Task details updated successfully' });
    } catch (err) {
        console.error('Error updating task details:', err);
        res.status(500).json({ error: 'Error updating task details' });
    }
});

module.exports = router;