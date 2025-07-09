import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import Database from './database.js';
import { validateForm, validateSubmission } from './validation.js';
import { exportToCsv } from './utils.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
const db = new Database();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use('/api', limiter);

// Submission rate limiting (more restrictive)
const submissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 submissions per minute
  message: 'Too many form submissions, please try again later',
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Forms endpoints
app.get('/api/forms', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const forms = await db.getForms(limit, offset);
    const total = await db.getFormsCount();

    res.json({
      success: true,
      data: forms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch forms' });
  }
});

app.get('/api/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const form = await db.getForm(id);
    
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    res.json({ success: true, data: form });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch form' });
  }
});

app.post('/api/forms', async (req, res) => {
  try {
    const formData = req.body;
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const formId = uuidv4();
    const now = new Date().toISOString();
    
    const form = {
      id: formId,
      title: formData.title || 'Untitled Form',
      description: formData.description || '',
      fields: JSON.stringify(formData.fields || []),
      settings: JSON.stringify(formData.settings || {}),
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.createForm(form);
    const createdForm = await db.getForm(formId);
    
    res.status(201).json({ success: true, data: createdForm });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ success: false, error: 'Failed to create form' });
  }
});

app.put('/api/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;
    
    const existingForm = await db.getForm(id);
    if (!existingForm) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    const validation = validateForm(formData);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const updates = {
      title: formData.title,
      description: formData.description,
      fields: JSON.stringify(formData.fields),
      settings: JSON.stringify(formData.settings),
      updatedAt: new Date().toISOString(),
    };

    await db.updateForm(id, updates);
    const updatedForm = await db.getForm(id);
    
    res.json({ success: true, data: updatedForm });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ success: false, error: 'Failed to update form' });
  }
});

app.delete('/api/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await db.getForm(id);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    await db.deleteForm(id);
    res.json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ success: false, error: 'Failed to delete form' });
  }
});

app.patch('/api/forms/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    
    const form = await db.getForm(id);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    await db.updateForm(id, { 
      isPublished: isPublished ? 1 : 0,
      updatedAt: new Date().toISOString(),
    });
    
    const updatedForm = await db.getForm(id);
    res.json({ success: true, data: updatedForm });
  } catch (error) {
    console.error('Error publishing form:', error);
    res.status(500).json({ success: false, error: 'Failed to publish form' });
  }
});

app.post('/api/forms/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const originalForm = await db.getForm(id);
    if (!originalForm) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    const newFormId = uuidv4();
    const now = new Date().toISOString();
    
    const duplicatedForm = {
      id: newFormId,
      title: `${originalForm.title} (Copy)`,
      description: originalForm.description,
      fields: originalForm.fields,
      settings: originalForm.settings,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.createForm(duplicatedForm);
    const newForm = await db.getForm(newFormId);
    
    res.status(201).json({ success: true, data: newForm });
  } catch (error) {
    console.error('Error duplicating form:', error);
    res.status(500).json({ success: false, error: 'Failed to duplicate form' });
  }
});

// Submissions endpoints
app.post('/api/forms/:id/submit', submissionLimiter, async (req, res) => {
  try {
    const { id: formId } = req.params;
    const { data: submissionData } = req.body;
    
    const form = await db.getForm(formId);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    if (!form.isPublished) {
      return res.status(403).json({ success: false, error: 'Form is not published' });
    }

    const validation = validateSubmission(submissionData, form.fields);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const submissionId = uuidv4();
    const submission = {
      id: submissionId,
      formId,
      data: JSON.stringify(submissionData),
      submittedAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };

    await db.createSubmission(submission);
    
    // Update form submission count
    await db.incrementSubmissionCount(formId);
    
    const createdSubmission = await db.getSubmission(submissionId);
    res.status(201).json({ success: true, data: createdSubmission });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ success: false, error: 'Failed to submit form' });
  }
});

app.get('/api/forms/:id/submissions', async (req, res) => {
  try {
    const { id: formId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const form = await db.getForm(formId);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    const submissions = await db.getSubmissions(formId, limit, offset);
    const total = await db.getSubmissionsCount(formId);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
  }
});

app.get('/api/forms/:id/submissions/export', async (req, res) => {
  try {
    const { id: formId } = req.params;
    
    const form = await db.getForm(formId);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    const submissions = await db.getAllSubmissions(formId);
    const csv = exportToCsv(submissions, form.fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="form-${formId}-submissions.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to export submissions' });
  }
});

// Analytics endpoints
app.get('/api/forms/:id/analytics', async (req, res) => {
  try {
    const { id: formId } = req.params;
    const period = req.query.period || '30d';
    
    const form = await db.getForm(formId);
    if (!form) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    const analytics = await db.getFormAnalytics(formId, period);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FormBuilder server running on port ${PORT}`);
  console.log(`📊 Database initialized and ready`);
  console.log(`🔒 Security middleware enabled`);
  console.log(`⚡ Unlimited records ready to store!`);
});