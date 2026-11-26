const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/jobs?search=...&location=...
router.get('/', async (req, res, next) => {
  try {
    const { search, location } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(filter)
      .populate('employer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID', data: null });
    }
    const job = await Job.findById(req.params.id).populate('employer', 'name email');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found', data: null });
    }
    res.json({ success: true, message: 'Job retrieved successfully', data: job });
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, authorize('employer'), async (req, res, next) => {
  try {
    const { title, description, location, salaryRange } = req.body;
    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and location are required',
        data: null,
      });
    }

    const job = await Job.create({
      title,
      description,
      location,
      salaryRange,
      employer: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, authorize('employer'), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID', data: null });
    }
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found', data: null });
    }
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job',
        data: null,
      });
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Job updated successfully', data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, authorize('employer'), async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID', data: null });
    }
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found', data: null });
    }
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job',
        data: null,
      });
    }

    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted successfully', data: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
