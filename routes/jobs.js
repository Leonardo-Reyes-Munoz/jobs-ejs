const express = require('express');
const router = express.Router();

const {
  getAllJobs,
  addJob,
  addForm,
  editForm,
  editJob,
  deleteJob,
} = require('../controllers/jobs');

router.route('/').get(getAllJobs).post(addJob);
router.route('/new').get(addForm);
router.route('/edit/:id').get(editForm);
router.route('/update/:id').post(editJob);
router.route('/delete/:id').post(deleteJob);

module.exports = router;
