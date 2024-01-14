const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.id }).sort('CreatedAt');
  res.render('jobs', { jobs });
};

const addJob = async (req, res) => {
  req.body.createdBy = req.user.id;
  await Job.create(req.body);
  res.status(StatusCodes.CREATED);

  const jobs = await Job.find({ createdBy: req.user.id }).sort('CreatedAt');
  res.render('jobs', { jobs });
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
  console.log(job.company);

  res.status(StatusCodes.OK).render('job', { job });
};

const editJob = async (req, res) => {
  res.send('Display Edit Job');
};

const deleteJob = async (req, res) => {
  res.send('Delete Job');
};

module.exports = {
  getAllJobs,
  addJob,
  addForm,
  editForm,
  editJob,
  deleteJob,
};
