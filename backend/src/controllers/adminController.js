const { User, AllowedStudent, Department, ClearanceRequest, DepartmentClearance, Complaint } = require('../models');
const { sendMail, emailTemplates } = require('../config/email');

const genFacultyId = (name) => 'FAC' + name.replace(/\s/g,'').slice(0,3).toUpperCase() + Date.now().toString().slice(-4);
const genTempPassword = () => Math.random().toString(36).slice(-8) + 'A1!';

// Teacher requests
exports.getPendingTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'teacher', isApproved: false },
      attributes: { exclude: ['password'] },
    });
    res.json(teachers);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approveTeacher = async (req, res) => {
  try {
    const teacher = await User.findByPk(req.params.id);
    if (!teacher || teacher.role !== 'teacher') return res.status(404).json({ message: 'Teacher not found' });

    const facultyId = genFacultyId(teacher.name);
    const tempPassword = genTempPassword();

    await teacher.update({ isApproved: true, facultyId, password: tempPassword, isFirstLogin: true });

    const tmpl = emailTemplates.teacherApproved({ name: teacher.name, facultyId }, tempPassword);
    await sendMail(teacher.email, tmpl.subject, tmpl.html);

    res.json({ message: 'Teacher approved and credentials sent by email' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.rejectTeacher = async (req, res) => {
  try {
    const { reason } = req.body;
    const teacher = await User.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    await teacher.update({ rejectionReason: reason });

    const tmpl = emailTemplates.teacherRejected({ name: teacher.name }, reason);
    await sendMail(teacher.email, tmpl.subject, tmpl.html);

    await teacher.destroy();
    res.json({ message: 'Teacher rejected and notified' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Student database management
exports.getAllowedStudents = async (req, res) => {
  try {
    const students = await AllowedStudent.findAll({ order: [['createdAt', 'DESC']] });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addAllowedStudent = async (req, res) => {
  try {
    const { universityRegNo, email, name, course, department, year } = req.body;
    const existing = await AllowedStudent.findOne({ where: { universityRegNo } });
    if (existing) return res.status(400).json({ message: 'Registration number already exists' });
    const student = await AllowedStudent.create({ universityRegNo, email, name, course, department, year });
    res.status(201).json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.bulkAddStudents = async (req, res) => {
  try {
    const { students } = req.body; // array of { universityRegNo, email, name, course, department, year }
    let added = 0, skipped = 0;
    for (const s of students) {
      const exists = await AllowedStudent.findOne({ where: { universityRegNo: s.universityRegNo } });
      if (!exists) { await AllowedStudent.create(s); added++; }
      else skipped++;
    }
    res.json({ message: `${added} students added, ${skipped} skipped (already exist)` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteAllowedStudent = async (req, res) => {
  try {
    await AllowedStudent.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Removed from allowed list' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalRequests, pendingRequests, completedRequests, pendingTeachers, allowedStudents] = await Promise.all([
      User.count({ where: { role: 'student' } }),
      User.count({ where: { role: 'teacher', isApproved: true } }),
      ClearanceRequest.count(),
      ClearanceRequest.count({ where: { status: 'pending' } }),
      ClearanceRequest.count({ where: { status: 'completed' } }),
      User.count({ where: { role: 'teacher', isApproved: false } }),
      AllowedStudent.count(),
    ]);
    res.json({ totalStudents, totalTeachers, totalRequests, pendingRequests, completedRequests, pendingTeachers, allowedStudents });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Users management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Departments
exports.getDepartments = async (req, res) => {
  try { res.json(await Department.findAll()); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await Department.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Department deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// All clearance requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ClearanceRequest.findAll({
      include: [
        { model: User, as: 'student', attributes: ['name','email','universityRegNo','course','department'] },
        { model: DepartmentClearance, as: 'deptClearances', include: [{ model: Department, as: 'department' }, { model: User, as: 'reviewer', attributes: ['name','designation'] }] },
      ],
      order: [['createdAt','DESC']],
    });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Complaints
exports.getComplaints = async (req, res) => {
  try { res.json(await Complaint.findAll({ order: [['createdAt','DESC']] })); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

exports.resolveComplaint = async (req, res) => {
  try {
    const { resolution } = req.body;
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    await complaint.update({ status: 'resolved', resolvedById: req.user.id, resolution });
    res.json({ message: 'Complaint resolved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
