const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'NoDues Portal <noreply@college.ac.in>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

// Email templates
const emailTemplates = {
  teacherApproved: (teacher, tempPassword) => ({
    subject: 'NoDues Portal — Your Account Has Been Approved',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0f6e56;padding:20px;text-align:center">
          <h2 style="color:white;margin:0">NoDues Clearance Portal</h2>
          <p style="color:#ccfbf1;margin:5px 0">${process.env.COLLEGE_NAME}</p>
        </div>
        <div style="padding:30px;background:#f8fafc">
          <h3 style="color:#0f172a">Dear ${teacher.name},</h3>
          <p>Your account request has been <strong style="color:#15803d">APPROVED</strong> by the admin.</p>
          <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0">
            <p style="margin:0 0 10px"><strong>Faculty ID:</strong> ${teacher.facultyId}</p>
            <p style="margin:0 0 10px"><strong>Temporary Password:</strong> <code style="background:#f1f5f9;padding:3px 8px;border-radius:4px">${tempPassword}</code></p>
            <p style="margin:0;color:#64748b;font-size:13px">Please change your password on first login.</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="display:inline-block;background:#0f6e56;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Login to Portal
          </a>
        </div>
      </div>`,
  }),

  teacherRejected: (teacher, reason) => ({
    subject: 'NoDues Portal — Account Request Update',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0f172a;padding:20px;text-align:center">
          <h2 style="color:white;margin:0">NoDues Clearance Portal</h2>
        </div>
        <div style="padding:30px;background:#f8fafc">
          <h3>Dear ${teacher.name},</h3>
          <p>Your account request has been <strong style="color:#dc2626">REJECTED</strong>.</p>
          <p><strong>Reason:</strong> ${reason || 'Please contact the admin for more details.'}</p>
        </div>
      </div>`,
  }),

  studentCredentials: (student, tempPassword) => ({
    subject: 'NoDues Portal — Your Account is Ready',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a56db;padding:20px;text-align:center">
          <h2 style="color:white;margin:0">NoDues Clearance Portal</h2>
          <p style="color:#dbeafe;margin:5px 0">${process.env.COLLEGE_NAME}</p>
        </div>
        <div style="padding:30px;background:#f8fafc">
          <h3>Dear ${student.name},</h3>
          <p>Your NoDues portal account has been created successfully.</p>
          <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0">
            <p style="margin:0 0 10px"><strong>Login ID:</strong> ${student.universityRegNo}</p>
            <p style="margin:0 0 10px"><strong>Temporary Password:</strong> <code style="background:#f1f5f9;padding:3px 8px;border-radius:4px">${tempPassword}</code></p>
            <p style="margin:0;color:#64748b;font-size:13px">Please change your password after first login.</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="display:inline-block;background:#1a56db;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Login to Portal
          </a>
        </div>
      </div>`,
  }),

  studentInvalidData: (email, name) => ({
    subject: 'NoDues Portal — Registration Issue',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#dc2626;padding:20px;text-align:center">
          <h2 style="color:white;margin:0">NoDues Clearance Portal</h2>
        </div>
        <div style="padding:30px;background:#f8fafc">
          <h3>Dear ${name || 'Student'},</h3>
          <p>Your registration details could <strong>not be verified</strong> in our database.</p>
          <p>If you believe this is an error, please submit a complaint using the link below:</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/complaint" 
             style="display:inline-block;background:#dc2626;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Submit Complaint
          </a>
        </div>
      </div>`,
  }),

  deptApproved: (student, deptName, teacherName) => ({
    subject: `NoDues Portal — ${deptName} Clearance Approved`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#15803d;padding:20px;text-align:center">
          <h2 style="color:white;margin:0">NoDues Clearance Portal</h2>
        </div>
        <div style="padding:30px;background:#f8fafc">
          <h3>Dear ${student.name},</h3>
          <p>✅ <strong>${deptName}</strong> department has cleared your no-dues request.</p>
          <p style="color:#64748b;font-size:13px">Approved by: ${teacherName}</p>
          <p>Login to the portal to check your overall clearance status.</p>
        </div>
      </div>`,
  }),

  deptRejected: (student, deptName, remarks) => ({
    subject: `NoDues Portal — ${deptName} Clearance Rejected`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#dc2626;padding:20px;text-align:center">
          <h2 style="color:white;margin:0">NoDues Clearance Portal</h2>
        </div>
        <div style="padding:30px;background:#f8fafc">
          <h3>Dear ${student.name},</h3>
          <p>❌ <strong>${deptName}</strong> department has rejected your no-dues request.</p>
          <div style="background:#fee2e2;border-radius:8px;padding:15px;margin:15px 0">
            <strong>Reason:</strong> ${remarks || 'Please contact the department for details.'}
          </div>
          <p>Login to the portal to view details and contact the department.</p>
        </div>
      </div>`,
  }),

  principalApproved: (student) => ({
    subject: 'NoDues Portal — Your Certificate is Ready to Download!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1a56db;padding:20px;text-align:center">
          <h2 style="color:white;margin:0">NoDues Clearance Portal</h2>
          <p style="color:#dbeafe;margin:5px 0">${process.env.COLLEGE_NAME}</p>
        </div>
        <div style="padding:30px;background:#f8fafc">
          <h3>Dear ${student.name},</h3>
          <p>🎉 Congratulations! Your No-Dues Clearance Certificate has been <strong style="color:#15803d">approved by the Principal</strong>.</p>
          <div style="background:#dcfce7;border-radius:8px;padding:15px;margin:15px 0;border-left:4px solid #15803d">
            <p style="margin:0">Your certificate is now ready to download. Please login to the portal, complete the digital signature, accept Terms & Conditions, and download your certificate.</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student" 
             style="display:inline-block;background:#1a56db;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
            Download My Certificate
          </a>
          <p style="color:#64748b;font-size:12px;margin-top:20px">This certificate is issued by ${process.env.COLLEGE_NAME}.</p>
        </div>
      </div>`,
  }),
};

module.exports = { sendMail, emailTemplates };
