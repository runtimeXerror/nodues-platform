const { body, validationResult } = require('express-validator');

const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

const validateLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handle,
];

const validateTeacherRegister = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid college email required'),
  body('password').isLength({ min: 6 }).withMessage('Min 6 characters'),
  body('designation').notEmpty().withMessage('Designation required'),
  body('departments').isArray({ min: 1 }).withMessage('Select at least one department'),
  handle,
];

const validateStudentRegister = [
  body('universityRegNo').trim().notEmpty().withMessage('University Reg. No. required'),
  body('email').isEmail().withMessage('Valid email required'),
  handle,
];

const validateClearanceForm = [
  body('studentName').trim().notEmpty().withMessage('Student name required'),
  body('regNo').trim().notEmpty().withMessage('Registration number required'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number required'),
  body('yearOfAdmission').trim().notEmpty().withMessage('Year of admission required'),
  body('dateOfLeaving').trim().notEmpty().withMessage('Date of leaving required'),
  body('contactNumber').trim().notEmpty().withMessage('Contact number required'),
  body('residentialAddress').trim().notEmpty().withMessage('Address required'),
  body('tcAccepted').equals('true').withMessage('You must accept Terms and Conditions'),
  handle,
];

module.exports = { validateLogin, validateTeacherRegister, validateStudentRegister, validateClearanceForm };
