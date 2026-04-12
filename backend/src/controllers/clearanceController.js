const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const { ClearanceRequest, DepartmentClearance, Department, User } = require('../models');
const { sendMail, emailTemplates } = require('../config/email');

exports.submitRequest = async (req, res) => {
  try {
    const { studentName, regNo, rollNumber, yearOfAdmission, dateOfLeaving, contactNumber, residentialAddress, academicYear, tcAccepted } = req.body;
    const studentId = req.user.id;
    const existing = await ClearanceRequest.findOne({ where: { studentId, status: ['pending', 'approved'] } });
    if (existing) return res.status(400).json({ message: 'You already have an active clearance request.' });
    const request = await ClearanceRequest.create({
      studentId, studentName, regNo, rollNumber, yearOfAdmission,
      dateOfLeaving, contactNumber, residentialAddress, academicYear,
      tcAccepted: tcAccepted === true || tcAccepted === 'true',
    });
    const departments = await Department.findAll();
    if (!departments.length) return res.status(400).json({ message: 'No departments configured. Contact admin.' });
    await DepartmentClearance.bulkCreate(
      departments.map(d => ({ clearanceRequestId: request.id, departmentId: d.id, status: 'pending' }))
    );
    res.status(201).json({ message: 'Clearance request submitted successfully!', requestId: request.id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ClearanceRequest.findAll({
      where: { studentId: req.user.id },
      include: [{
        model: DepartmentClearance, as: 'deptClearances',
        include: [
          { model: Department, as: 'department' },
          { model: User, as: 'reviewer', attributes: ['name', 'designation', 'facultyId'] },
        ],
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getTeacherRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const teacher = req.user;
    const teacherDepts = JSON.parse(teacher.departments || '[]');
    const { rows: clearances, count } = await DepartmentClearance.findAndCountAll({
      where: { departmentId: teacherDepts },
      include: [
        { model: Department, as: 'department' },
        {
          model: ClearanceRequest, as: 'clearanceRequest',
          include: [{ model: User, as: 'student', attributes: ['name', 'email', 'universityRegNo', 'rollNumber', 'course', 'department'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ clearances, total: count, pages: Math.ceil(count / limit), page: parseInt(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateDeptClearance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const teacher = req.user;
    const clearance = await DepartmentClearance.findByPk(id, {
      include: [
        { model: Department, as: 'department' },
        { model: ClearanceRequest, as: 'clearanceRequest', include: [{ model: User, as: 'student' }] },
      ],
    });
    if (!clearance) return res.status(404).json({ message: 'Not found' });
    const now = new Date();
    const dateStr = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const teacherSignature = status === 'approved'
      ? `${teacher.name} | ${teacher.designation || 'Faculty'} | ${clearance.department.name} | ${dateStr}`
      : null;
    await clearance.update({ status, remarks, reviewedById: teacher.id, reviewedAt: now, teacherSignature });
    const student = clearance.clearanceRequest.student;
    const deptName = clearance.department.name;
    if (status === 'approved') {
      const tmpl = emailTemplates.deptApproved({ name: student.name }, deptName, teacher.name);
      await sendMail(student.email, tmpl.subject, tmpl.html);
    } else {
      const tmpl = emailTemplates.deptRejected({ name: student.name }, deptName, remarks);
      await sendMail(student.email, tmpl.subject, tmpl.html);
    }
    const allDept = await DepartmentClearance.findAll({ where: { clearanceRequestId: clearance.clearanceRequestId } });
    const allApproved = allDept.every(d => d.status === 'approved');
    const anyRejected = allDept.some(d => d.status === 'rejected');
    if (allApproved) await ClearanceRequest.update({ status: 'approved' }, { where: { id: clearance.clearanceRequestId } });
    else if (anyRejected) await ClearanceRequest.update({ status: 'rejected' }, { where: { id: clearance.clearanceRequestId } });
    res.json({ message: `Department clearance ${status}`, allApproved, anyRejected });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getPrincipalRequests = async (req, res) => {
  try {
    const requests = await ClearanceRequest.findAll({
      where: { status: 'approved' },
      include: [
        { model: User, as: 'student', attributes: ['name', 'email', 'universityRegNo', 'course', 'department'] },
        { model: DepartmentClearance, as: 'deptClearances', include: [{ model: Department, as: 'department' }, { model: User, as: 'reviewer', attributes: ['name', 'designation'] }] },
      ],
      order: [['updatedAt', 'DESC']],
    });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.principalApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const request = await ClearanceRequest.findByPk(id, { include: [{ model: User, as: 'student' }] });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    const certId = 'CERT-' + Date.now() + '-' + Math.random().toString(36).slice(-4).toUpperCase();
    await request.update({ status: 'completed', principalRemarks: remarks, completedAt: new Date(), certificateId: certId });
    const tmpl = emailTemplates.principalApproved({ name: request.student.name });
    await sendMail(request.student.email, tmpl.subject, tmpl.html);
    res.json({ message: 'Final approval done. Student notified by email.', certId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.principalReject = async (req, res) => {
  try {
    const { remarks } = req.body;
    await ClearanceRequest.update({ status: 'rejected', principalRemarks: remarks }, { where: { id: req.params.id } });
    res.json({ message: 'Request rejected' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.signAndDownload = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { signature, tcAccepted } = req.body;

    if (!signature) return res.status(400).json({ message: 'Digital signature required' });
    if (!tcAccepted) return res.status(400).json({ message: 'Please accept Terms and Conditions' });

    const request = await ClearanceRequest.findByPk(requestId, {
      include: [
        { model: User, as: 'student' },
        {
          model: DepartmentClearance, as: 'deptClearances',
          include: [
            { model: Department, as: 'department' },
            { model: User, as: 'reviewer', attributes: ['name', 'designation'] },
          ],
        },
      ],
    });

    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.studentId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (request.status !== 'completed') return res.status(400).json({ message: 'Certificate not yet approved by Principal' });

    const now = new Date();
    await request.update({ studentSignature: signature, tcSignedAt: now });

    const collegeName = process.env.COLLEGE_NAME || 'College of Engineering';
    const collegeShort = process.env.COLLEGE_SHORT || 'COE';
    const completedDate = new Date(request.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const signedAt = now.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: white; }
  .page { width: 210mm; min-height: 297mm; padding: 8mm; border: 2px solid #003366; position: relative; }
  .inner-border { border: 1px solid #1a56db; padding: 4mm; min-height: calc(297mm - 24mm); }
  .header { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 4px; }
  .logo-box { width: 55px; height: 55px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 7px; color: #666; text-align: center; flex-shrink: 0; }
  .header-center { text-align: center; flex: 1; }
  .beu-dept { font-size: 8px; color: #333; }
  .beu-name { font-size: 16px; font-weight: bold; color: #003366; }
  hr.thick { border: none; border-top: 2px solid #003366; margin: 3px 0; }
  hr.thin { border: none; border-top: 1px solid #cbd5e1; margin: 3px 0; }
  .college-name { font-size: 13px; font-weight: bold; color: #003366; text-align: center; }
  .college-addr { font-size: 8px; color: #475569; text-align: center; }
  .nodues-wrap { text-align: center; margin: 6px 0; }
  .nodues-box { display: inline-block; border: 2px solid #003366; background: #dbeafe; padding: 4px 40px; }
  .nodues-title { font-size: 15px; font-weight: bold; color: #003366; letter-spacing: 6px; }
  .student-box { border: 1px solid #cbd5e1; background: #fafafa; padding: 6px 8px; margin: 5px 0; }
  .student-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 10px; }
  .field-row { display: flex; align-items: baseline; gap: 4px; }
  .fl { font-weight: bold; font-size: 9px; white-space: nowrap; min-width: 115px; }
  .fv { font-size: 9px; border-bottom: 1px solid #000; flex: 1; padding-bottom: 1px; }
  .full { grid-column: 1 / -1; }
  table.sec { width: 100%; border-collapse: collapse; margin: 4px 0; }
  .sec-hdr { background: #1e3a8a; color: white; text-align: center; font-size: 10px; font-weight: bold; padding: 5px; }
  th.ch { background: #2d5fad; color: white; font-size: 8.5px; font-weight: bold; text-align: center; padding: 4px 3px; border: 1px solid #1e3a8a; }
  td.r { font-size: 8.5px; padding: 4px 5px; border: 1px solid #cbd5e1; vertical-align: middle; }
  .odd { background: #fff; }
  .even { background: #f0f7ff; }
  .nil { color: #15803d; font-weight: bold; text-align: center; }

  /* Teacher verified badge style */
  .signed-wrap { display: flex; align-items: center; gap: 4px; }
  .verified-badge { display: inline-flex; align-items: center; justify-content: center; background: #1d9bf0; color: white; border-radius: 50%; width: 11px; height: 11px; font-size: 7px; font-weight: bold; flex-shrink: 0; }
  .signed-yes { color: #15803d; font-size: 8px; font-weight: bold; }
  .signed-who { font-size: 8px; color: #0f6e56; font-family: 'Georgia', serif; font-style: italic; font-weight: bold; margin-top: 1px; }

  .stamp { background: #dcfce7; border: 1.5px solid #15803d; text-align: center; padding: 7px; margin: 8px 0 4px; }
  .stamp-text { color: #15803d; font-weight: bold; font-size: 11px; }
  .cert-id { font-size: 8px; color: #475569; margin-top: 3px; }

  /* Signature section */
  .sig-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px; gap: 10px; }
  .sig-box { font-size: 9px; flex: 1; }
  .sig-title { font-weight: bold; font-size: 9.5px; margin-bottom: 6px; color: #003366; text-decoration: underline; }

  /* Student signature - italic cursive style */
  .student-sig-name { color: #1a56db; font-weight: bold; font-size: 14px; font-family: 'Georgia', serif; font-style: italic; letter-spacing: 0.5px; }
  .sig-date { color: #64748b; font-size: 8px; margin-top: 3px; }
  .sig-line { border-top: 1px solid #94a3b8; margin-top: 10px; padding-top: 3px; font-size: 8px; color: #475569; text-align: center; font-weight: bold; }

  /* Principal signature - different style */
  .principal-sig-name { font-family: 'Georgia', serif; font-size: 13px; font-weight: bold; color: #003366; font-style: italic; letter-spacing: 1px; border-bottom: 1px solid #003366; padding-bottom: 2px; display: inline-block; }
  .principal-college { font-size: 8px; color: #475569; margin-top: 4px; line-height: 1.4; }
  .principal-approved { font-size: 8px; color: #15803d; font-weight: bold; margin-top: 3px; }

  /* Seal */
  .seal { width: 80px; height: 80px; border-radius: 50%; border: 2.5px solid #003366; display: flex; align-items: center; justify-content: center; margin: 0 10px; flex-shrink: 0; }
  .seal-in { width: 70px; height: 70px; border-radius: 50%; border: 1px solid #1a56db; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .seal-t { font-size: 9px; font-weight: bold; color: #003366; }
  .seal-s { font-size: 7px; color: #003366; line-height: 1.3; }
  .footer { text-align: center; font-size: 7.5px; color: #94a3b8; margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 4px; }
</style>
</head>
<body>
<div class="page"><div class="inner-border">

<div class="header">
  <div class="logo-box">BEU<br/>LOGO</div>
  <div class="header-center">
    <div class="beu-dept">Department of Science, Technology and Technical Education, Government of Bihar</div>
    <div class="beu-name">Bihar Engineering University, Patna</div>
  </div>
  <div class="logo-box">COLLEGE<br/>LOGO</div>
</div>
<hr class="thick"/>
<div class="college-name">${collegeName}</div>
<div class="college-addr">PO- Ulao, Singhaul, Begusarai - 851134 (Bihar)</div>
<hr class="thin"/>

<div class="nodues-wrap">
  <div class="nodues-box"><div class="nodues-title">N O D U E S</div></div>
</div>

<div class="student-box">
  <div class="student-grid">
    <div class="field-row"><span class="fl">Student Name :</span><span class="fv">${request.studentName}</span></div>
    <div class="field-row"><span class="fl">Date of Leaving :</span><span class="fv">${request.dateOfLeaving}</span></div>
    <div class="field-row"><span class="fl">Roll No. :</span><span class="fv">${request.rollNumber}</span></div>
    <div class="field-row"><span class="fl">Contact Number :</span><span class="fv">${request.contactNumber}</span></div>
    <div class="field-row"><span class="fl">College Name :</span><span class="fv" style="font-size:8px">${collegeName.split(',')[0]}</span></div>
    <div class="field-row"><span class="fl">Year of Admission :</span><span class="fv">${request.yearOfAdmission}</span></div>
    <div class="field-row full"><span class="fl">Residential Address :</span><span class="fv">${request.residentialAddress}</span></div>
  </div>
</div>

<table class="sec">
  <tr><td colspan="5" class="sec-hdr">GENERAL SECTIONS</td></tr>
  <tr>
    <th class="ch" style="width:28px">Sl.<br/>No.</th>
    <th class="ch" style="width:145px">Lab / Section Name</th>
    <th class="ch" style="width:158px">Name of Section Incharge</th>
    <th class="ch" style="width:52px">Detail of<br/>Dues</th>
    <th class="ch">Signature of Section Incharge</th>
  </tr>
  ${request.deptClearances.map((dc, i) => `
  <tr class="${i % 2 === 0 ? 'odd' : 'even'}">
    <td class="r" style="text-align:center">${i + 1}</td>
    <td class="r">${dc.department?.name || ''}</td>
    <td class="r">${dc.reviewer?.name || ''}</td>
    <td class="r ${dc.status === 'approved' ? 'nil' : ''}">${dc.status === 'approved' ? 'NIL' : ''}</td>
    <td class="r">
      ${dc.status === 'approved' && dc.teacherSignature ? `
        <div class="signed-wrap">
          <span class="verified-badge">&#10003;</span>
          <span class="signed-yes">Digitally Verified</span>
        </div>
        <div class="signed-who">${dc.teacherSignature.split('|')[0]?.trim() || ''}</div>
      ` : ''}
    </td>
  </tr>`).join('')}
</table>

<div class="stamp">
  <div class="stamp-text">&#10003; &nbsp; ALL DUES CLEARED — APPROVED BY PRINCIPAL</div>
  <div class="cert-id">Certificate ID: ${request.certificateId} &nbsp;|&nbsp; Clearance Date: ${completedDate}</div>
</div>

<div class="sig-row">
  <!-- Student Signature -->
  <div class="sig-box">
    <div class="sig-title">Student Signature</div>
    <div class="student-sig-name">${signature}</div>
    <div class="sig-date">Signed on: ${signedAt}</div>
    <div class="sig-line">${request.studentName}</div>
  </div>

  <!-- College Seal -->
  <div class="seal">
    <div class="seal-in">
      <div class="seal-t">${collegeShort}</div>
      <div class="seal-s">OFFICIAL<br/>SEAL</div>
    </div>
  </div>

  <!-- Principal Signature -->
  <div class="sig-box" style="text-align:right">
    <div class="sig-title">Principal</div>
    <div class="principal-sig-name">Principal, RRSDCE</div>
    <div class="principal-approved">&#10003; Digitally Approved</div>
    <div class="sig-date">${completedDate}</div>
    <div class="sig-line">Principal / Director</div>
  </div>
</div>

<div class="footer">This is a digitally generated certificate. Verify authenticity using the Certificate ID above.</div>
</div></div>
</body></html>`;

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=NoDues-${request.regNo}.pdf`);
    res.send(pdf);

  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
};

exports.submitComplaint = async (req, res) => {
  try {
    const { Complaint } = require('../models');
    const { studentName, regNo, email, issue } = req.body;
    await Complaint.create({ studentName, regNo, email, issue });
    res.status(201).json({ message: 'Complaint submitted. Principal assistant will review and contact you.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};