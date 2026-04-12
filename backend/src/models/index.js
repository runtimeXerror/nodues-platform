const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

// ── User ─────────────────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:            { type: DataTypes.STRING, allowNull: false },
  email:           { type: DataTypes.STRING, allowNull: false, unique: true },
  password:        { type: DataTypes.STRING, allowNull: false },
  role:            { type: DataTypes.ENUM('student','teacher','admin','principal','principal_assistant'), defaultValue: 'student' },
  // Student fields
  universityRegNo: { type: DataTypes.STRING },
  rollNumber:      { type: DataTypes.STRING },
  course:          { type: DataTypes.STRING },
  department:      { type: DataTypes.STRING },
  year:            { type: DataTypes.STRING },
  yearOfAdmission: { type: DataTypes.STRING },
  dateOfLeaving:   { type: DataTypes.STRING },
  contactNumber:   { type: DataTypes.STRING },
  residentialAddress: { type: DataTypes.TEXT },
  // Teacher fields
  facultyId:       { type: DataTypes.STRING, unique: true },
  designation:     { type: DataTypes.STRING },
  departments:     { type: DataTypes.TEXT }, // JSON array of dept IDs
  // Status
  isApproved:      { type: DataTypes.BOOLEAN, defaultValue: false },
  isFirstLogin:    { type: DataTypes.BOOLEAN, defaultValue: true },
  rejectionReason: { type: DataTypes.TEXT },
}, {
  hooks: {
    beforeCreate: async (u) => { if (u.password) u.password = await bcrypt.hash(u.password, 10); },
    beforeUpdate: async (u) => { if (u.changed('password')) u.password = await bcrypt.hash(u.password, 10); },
  },
});
User.prototype.comparePassword = async function(pw) { return bcrypt.compare(pw, this.password); };

// ── AllowedStudent ────────────────────────────────────────────────────────────
const AllowedStudent = sequelize.define('AllowedStudent', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  universityRegNo: { type: DataTypes.STRING, allowNull: false, unique: true },
  email:           { type: DataTypes.STRING, allowNull: false },
  name:            { type: DataTypes.STRING, allowNull: false },
  course:          { type: DataTypes.STRING },
  department:      { type: DataTypes.STRING },
  year:            { type: DataTypes.STRING },
  isRegistered:    { type: DataTypes.BOOLEAN, defaultValue: false },
});

// ── Department ────────────────────────────────────────────────────────────────
const Department = sequelize.define('Department', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  code:        { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.STRING },
});

// ── ClearanceRequest ──────────────────────────────────────────────────────────
const ClearanceRequest = sequelize.define('ClearanceRequest', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentId:    { type: DataTypes.INTEGER, allowNull: false },
  // Form fields (appear on certificate)
  studentName:  { type: DataTypes.STRING, allowNull: false },
  regNo:        { type: DataTypes.STRING, allowNull: false },
  rollNumber:   { type: DataTypes.STRING, allowNull: false },
  yearOfAdmission: { type: DataTypes.STRING, allowNull: false },
  dateOfLeaving:{ type: DataTypes.STRING, allowNull: false },
  contactNumber:{ type: DataTypes.STRING, allowNull: false },
  residentialAddress: { type: DataTypes.TEXT, allowNull: false },
  academicYear: { type: DataTypes.STRING },
  tcAccepted:   { type: DataTypes.BOOLEAN, defaultValue: false },
  status:       { type: DataTypes.ENUM('pending','approved','rejected','completed'), defaultValue: 'pending' },
  principalRemarks: { type: DataTypes.TEXT },
  completedAt:  { type: DataTypes.DATE },
  // Digital signing
  studentSignature:  { type: DataTypes.STRING },  // typed name
  tcSignedAt:        { type: DataTypes.DATE },
  certificateId:     { type: DataTypes.STRING },  // unique cert ID
});

// ── DepartmentClearance ───────────────────────────────────────────────────────
const DepartmentClearance = sequelize.define('DepartmentClearance', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clearanceRequestId: { type: DataTypes.INTEGER, allowNull: false },
  departmentId:     { type: DataTypes.INTEGER, allowNull: false },
  reviewedById:     { type: DataTypes.INTEGER },
  status:           { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
  remarks:          { type: DataTypes.TEXT },
  reviewedAt:       { type: DataTypes.DATE },
  // Auto digital signature
  teacherSignature: { type: DataTypes.STRING },  // "Dr. XYZ | HOD | Dept | 2025-01-01 10:30"
});

// ── Complaint ─────────────────────────────────────────────────────────────────
const Complaint = sequelize.define('Complaint', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  studentName: { type: DataTypes.STRING, allowNull: false },
  regNo:       { type: DataTypes.STRING, allowNull: false },
  email:       { type: DataTypes.STRING, allowNull: false },
  issue:       { type: DataTypes.TEXT, allowNull: false },
  status:      { type: DataTypes.ENUM('pending','resolved','rejected'), defaultValue: 'pending' },
  resolvedById:{ type: DataTypes.INTEGER },
  resolution:  { type: DataTypes.TEXT },
});

// ── Associations ──────────────────────────────────────────────────────────────
ClearanceRequest.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
User.hasMany(ClearanceRequest, { foreignKey: 'studentId', as: 'requests' });

DepartmentClearance.belongsTo(ClearanceRequest, { foreignKey: 'clearanceRequestId', as: 'clearanceRequest' });
ClearanceRequest.hasMany(DepartmentClearance, { foreignKey: 'clearanceRequestId', as: 'deptClearances' });

DepartmentClearance.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
DepartmentClearance.belongsTo(User, { foreignKey: 'reviewedById', as: 'reviewer' });

Complaint.belongsTo(User, { foreignKey: 'resolvedById', as: 'resolver' });

module.exports = { User, AllowedStudent, Department, ClearanceRequest, DepartmentClearance, Complaint };
