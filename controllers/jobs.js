const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const parseVErr = require('../utils/parseValidationErr');

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.id }).sort('CreatedAt');
  res.status(StatusCodes.OK).render('jobs', { jobs });
};

const addJob = async (req, res) => {
  req.body.createdBy = req.user.id;
  await Job.create(req.body);
  res.status(StatusCodes.CREATED);

  const jobs = await Job.find({ createdBy: req.user.id }).sort('CreatedAt');
  const info = [`Job has been successfully added.`];
  res.render('jobs', { jobs, info });
};

const addForm = async (req, res) => {
  res.render('job', { job: null });
};

const editForm = async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
  });

  if (!job) {
    throw new Error(`No job with id ${req.params.id}`);
  }
  res.status(StatusCodes.OK).render('job', { job });
};

const editJob = async (req, res) => {
  const {
    body: { company, position, status },
    user: { id: userId },
    params: { id: jobId },
  } = req;

  if (company === '' || position === '') {
    throw new Error('Company of position fields cannot be empty');
  }

  const job = await Job.findOneAndUpdate(
    {
      _id: jobId,
      createdBy: userId,
    },
    req.body,
    { new: true, runValidators: true }
  );
  const info = [`Job has been successfully updated.`];

  if (!job) {
    throw new Error(`No job with id ${jobId} found.`);
  }

  const jobs = await Job.find({ createdBy: userId }).sort('CreatedAt');
  res.render('jobs', { jobs, info });
};

const deleteJob = async (req, res) => {
  const {
    user: { id: userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOneAndDelete({
    _id: jobId,
    createdBy: userId,
  });

  const info = [`Job has been successfully deleted.`];

  if (!job) {
    throw new Error(`No job with id ${jobId} found`);
  }

  const jobs = await Job.find({ createdBy: userId }).sort('CreatedAt');
  res.render('jobs', { jobs, info });
};

module.exports = {
  getAllJobs,
  addJob,
  addForm,
  editForm,
  editJob,
  deleteJob,
};
