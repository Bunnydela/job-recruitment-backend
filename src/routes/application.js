const express = require('express');
const Application = require('../models/Application');
const protect = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const application = await Application.create({
      ...req.body,
      applicant: req.user._id,
    });
    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title company')
      .populate('applicant', 'name email');
    res.json(applications);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
