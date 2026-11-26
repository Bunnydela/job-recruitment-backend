const express = require('express');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Candidate applies to a job
router.post('/', protect, authorize('candidate'), async (req, res, next) => {
  try {
    const { job, coverLetter } = req.body;
    if (!job || !mongoose.Types.ObjectId.isValid(job)) {
      return res.status(400).json({
        success: false,
        message: 'A valid job ID is required',
        data: null,
      });
    }

    const existingJob = await Job.findById(job);
    if (!existingJob || !existingJob.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer active',
        data: null,
      });
    }

    const duplicate = await Application.findOne({ job, candidate: req.user._id });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job',
        data: null,
      });
    }

    const application = await Application.create({
      job,
      candidate: req.user._id,
      coverLetter,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (err) {
    next(err);
  }
});

// Candidates see their own applications; Employers see applications for their jobs
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'candidate') {
      query = { candidate: req.user._id };
    } else if (req.user.role === 'employer') {
      const employerJobs = await Job.find({ employer: req.user._id }).select('_id');
      query = { job: { $in: employerJobs.map((j) => j._id) } };
    }

    const applications = await Application.find(query)
      .populate('job', 'title location salaryRange')
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Applications retrieved successfully',
      data: applications,
    });
  } catch (err) {
    next(err);
  }
});

// Employer updates application status
router.patch('/:id/status', protect, authorize('employer'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        data: null,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID', data: null });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found', data: null });
    }
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application',
        data: null,
      });
    }

    application.status = status;
    await application.save();

    res.json({
      success: true,
      message: 'Application status updated',
      data: application,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
