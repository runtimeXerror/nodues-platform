const authRouter = require('express').Router();
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateLogin, validateTeacherRegister, validateStudentRegister } = require('../middleware/validate');

authRouter.get('/check-setup', auth.checkSetup);
authRouter.post('/setup', auth.setupAdmin);
authRouter.post('/login', validateLogin, auth.login);
authRouter.post('/student-login', auth.studentLogin);
authRouter.post('/teacher-register', validateTeacherRegister, auth.teacherRegister);
authRouter.post('/student-register', validateStudentRegister, auth.studentRegister);
authRouter.put('/change-password', authenticate, auth.changePassword);
authRouter.get('/me', authenticate, auth.getMe);
authRouter.get('/create-principal', auth.createPrincipal);

authRouter.get('/reset-password/:identifier', async (req, res) => {
  try {
    const { User } = require('../models');
    const { identifier } = req.params;
    
    // Try email first, then universityRegNo
    let user = await User.findOne({ where: { email: identifier } });
    if (!user) user = await User.findOne({ where: { universityRegNo: identifier } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await user.update({ password: 'Test@1234', isFirstLogin: true });
    res.json({ message: `Password reset for ${user.name} (${user.role})` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

authRouter.get('/generate-hash/:password', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash(req.params.password, 10);
  res.json({ hash });
});

const adminRouter = require('express').Router();
const admin = require('../controllers/adminController');
const { authorize } = require('../middleware/auth');

adminRouter.use(authenticate);
adminRouter.use(authorize('admin'));

adminRouter.get('/stats', admin.getStats);
adminRouter.get('/pending-teachers', admin.getPendingTeachers);
adminRouter.post('/approve-teacher/:id', admin.approveTeacher);
adminRouter.post('/reject-teacher/:id', admin.rejectTeacher);
adminRouter.get('/users', admin.getAllUsers);
adminRouter.delete('/users/:id', admin.deleteUser);
adminRouter.get('/departments', admin.getDepartments);
adminRouter.post('/departments', admin.addDepartment);
adminRouter.delete('/departments/:id', admin.deleteDepartment);
adminRouter.get('/allowed-students', admin.getAllowedStudents);
adminRouter.post('/allowed-students', admin.addAllowedStudent);
adminRouter.post('/allowed-students/bulk', admin.bulkAddStudents);
adminRouter.delete('/allowed-students/:id', admin.deleteAllowedStudent);
adminRouter.get('/requests', admin.getAllRequests);
adminRouter.get('/complaints', admin.getComplaints);
adminRouter.patch('/complaints/:id/resolve', admin.resolveComplaint);

const clearanceRouter = require('express').Router();
const clearance = require('../controllers/clearanceController');
const { validateClearanceForm } = require('../middleware/validate');

// ✅ PUBLIC — departments (BEFORE authenticate middleware)
clearanceRouter.get('/departments', async (req, res) => {
  try {
    const { Department } = require('../models');
    res.json(await Department.findAll());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ PUBLIC — complaint
clearanceRouter.post('/complaint', clearance.submitComplaint);

// 🔒 All routes below need authentication
clearanceRouter.use(authenticate);

// Student
clearanceRouter.post('/submit', authorize('student'), validateClearanceForm, clearance.submitRequest);
clearanceRouter.get('/my', authorize('student'), clearance.getMyRequests);
clearanceRouter.post('/:requestId/sign-download', authorize('student'), clearance.signAndDownload);

// Teacher
clearanceRouter.get('/teacher-requests', authorize('teacher', 'admin'), clearance.getTeacherRequests);
clearanceRouter.patch('/dept/:id', authorize('teacher', 'admin'), clearance.updateDeptClearance);

// Principal
clearanceRouter.get('/principal-pending', authorize('principal', 'admin'), clearance.getPrincipalRequests);
clearanceRouter.post('/principal-approve/:id', authorize('principal', 'admin'), clearance.principalApprove);
clearanceRouter.post('/principal-reject/:id', authorize('principal', 'admin'), clearance.principalReject);

module.exports = { authRouter, adminRouter, clearanceRouter };
