const jwt = require('jsonwebtoken');
const { User, AllowedStudent } = require('../models');
const { sendMail, emailTemplates } = require('../config/email');

const genToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const genTempPassword = () => Math.random().toString(36).slice(-8) + 'A1!';

exports.checkSetup = async (req, res) => {
  const admin = await User.findOne({ where: { role: 'admin' } });
  res.json({ adminExists: !!admin });
};

exports.setupAdmin = async (req, res) => {
  try {
    const existing = await User.findOne({ where: { role: 'admin' } });
    if (existing) return res.status(400).json({ message: 'Admin already set up. Please login.' });
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const admin = await User.create({ name, email, password, role: 'admin', isApproved: true, isFirstLogin: false });
    const token = genToken(admin);
    res.status(201).json({ message: 'Admin setup complete', token, user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    console.log('User:', user.email, '| Role:', user.role);
    const valid = await user.comparePassword(password);
    console.log('Password valid:', valid);

    if (!user.isApproved && user.role !== 'student') {
      return res.status(403).json({ message: 'Your account is pending admin approval' });
    }
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = genToken(user);
    res.json({
      token,
      isFirstLogin: user.isFirstLogin,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, facultyId: user.facultyId, departments: user.departments, isFirstLogin: user.isFirstLogin },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.studentLogin = async (req, res) => {
  try {
    const { universityRegNo, password } = req.body;
    const user = await User.findOne({ where: { universityRegNo, role: 'student' } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isApproved) return res.status(403).json({ message: 'Account not yet activated' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = genToken(user);
    res.json({
      token,
      isFirstLogin: user.isFirstLogin,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, universityRegNo: user.universityRegNo, rollNumber: user.rollNumber, course: user.course, department: user.department, isFirstLogin: user.isFirstLogin },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.teacherRegister = async (req, res) => {
  try {
    const { name, email, designation, departments, password } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    await User.create({
      name, email, password, role: 'teacher',
      designation,
      departments: JSON.stringify(departments),
      isApproved: false,
      isFirstLogin: true,
    });
    res.status(201).json({ message: 'Join request submitted. Admin will review and notify you by email.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.studentRegister = async (req, res) => {
  try {
    const { universityRegNo, email } = req.body;
    const allowed = await AllowedStudent.findOne({ where: { universityRegNo, email } });
    if (!allowed) {
      await sendMail(email, ...Object.values(emailTemplates.studentInvalidData(email, 'Student')));
      return res.status(400).json({ message: 'Your details were not found in our database.' });
    }
    if (allowed.isRegistered) return res.status(400).json({ message: 'This registration number already has an account.' });
    const tempPassword = genTempPassword();
    await User.create({
      name: allowed.name, email: allowed.email,
      universityRegNo: allowed.universityRegNo,
      password: tempPassword, role: 'student',
      course: allowed.course, department: allowed.department,
      year: allowed.year, isApproved: true, isFirstLogin: true,
    });
    await allowed.update({ isRegistered: true });
    const tmpl = emailTemplates.studentCredentials({ name: allowed.name, universityRegNo }, tempPassword);
    await sendMail(allowed.email, tmpl.subject, tmpl.html);
    res.status(201).json({ message: 'Account created! Check your email for login credentials.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'Min 6 characters required' });
    await req.user.update({ password: newPassword, isFirstLogin: false });
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMe = async (req, res) => {
  const u = req.user;
  res.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role, universityRegNo: u.universityRegNo, rollNumber: u.rollNumber, course: u.course, department: u.department, facultyId: u.facultyId, departments: u.departments, isFirstLogin: u.isFirstLogin } });
};

exports.createPrincipal = async (req, res) => {
  try {
    const existing = await User.findOne({ where: { email: 'principal@college.ac.in' } });
    if (existing) {
      await existing.update({ password: 'Test@1234', isApproved: true, isFirstLogin: true });
      return res.json({ message: 'Principal password updated' });
    }
    await User.create({
      name: 'Principal RRSDCE', email: 'principal@college.ac.in',
      password: 'Test@1234', role: 'principal', isApproved: true, isFirstLogin: true,
    });
    res.json({ message: 'Principal created' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};