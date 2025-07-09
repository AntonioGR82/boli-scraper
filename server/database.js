import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  constructor() {
    this.db = new sqlite3.Database(join(__dirname, 'formbuilder.db'));
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // Forms table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS forms (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          fields TEXT NOT NULL,
          settings TEXT NOT NULL,
          isPublished INTEGER DEFAULT 0,
          submissionCount INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      // Submissions table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS submissions (
          id TEXT PRIMARY KEY,
          formId TEXT NOT NULL,
          data TEXT NOT NULL,
          submittedAt TEXT NOT NULL,
          ip TEXT,
          userAgent TEXT,
          FOREIGN KEY (formId) REFERENCES forms (id) ON DELETE CASCADE
        )
      `);

      // Create indexes for better performance
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms (createdAt)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_forms_published ON forms (isPublished)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions (formId)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions (submittedAt)`);
    });

    console.log('📊 Database initialized successfully');
  }

  // Forms methods
  async getForms(limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, title, description, fields, settings, isPublished, 
               submissionCount, createdAt, updatedAt
        FROM forms 
        ORDER BY createdAt DESC 
        LIMIT ? OFFSET ?
      `;
      
      this.db.all(sql, [limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const forms = rows.map(row => ({
            ...row,
            fields: JSON.parse(row.fields),
            settings: JSON.parse(row.settings),
            isPublished: Boolean(row.isPublished),
          }));
          resolve(forms);
        }
      });
    });
  }

  async getFormsCount() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as count FROM forms', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  async getForm(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, title, description, fields, settings, isPublished, 
               submissionCount, createdAt, updatedAt
        FROM forms 
        WHERE id = ?
      `;
      
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          const form = {
            ...row,
            fields: JSON.parse(row.fields),
            settings: JSON.parse(row.settings),
            isPublished: Boolean(row.isPublished),
          };
          resolve(form);
        }
      });
    });
  }

  async createForm(form) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO forms (id, title, description, fields, settings, isPublished, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        form.id,
        form.title,
        form.description,
        form.fields,
        form.settings,
        form.isPublished ? 1 : 0,
        form.createdAt,
        form.updatedAt
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async updateForm(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      const sql = `UPDATE forms SET ${setClause} WHERE id = ?`;
      
      this.db.run(sql, [...values, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  async deleteForm(id) {
    return new Promise((resolve, reject) => {
      // First delete all submissions for this form
      this.db.run('DELETE FROM submissions WHERE formId = ?', [id], (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Then delete the form
        this.db.run('DELETE FROM forms WHERE id = ?', [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        });
      });
    });
  }

  async incrementSubmissionCount(formId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE forms SET submissionCount = submissionCount + 1 WHERE id = ?',
        [formId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  // Submissions methods
  async createSubmission(submission) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO submissions (id, formId, data, submittedAt, ip, userAgent)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        submission.id,
        submission.formId,
        submission.data,
        submission.submittedAt,
        submission.ip,
        submission.userAgent
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async getSubmission(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM submissions WHERE id = ?';
      
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          const submission = {
            ...row,
            data: JSON.parse(row.data),
          };
          resolve(submission);
        }
      });
    });
  }

  async getSubmissions(formId, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, formId, data, submittedAt, ip, userAgent
        FROM submissions 
        WHERE formId = ?
        ORDER BY submittedAt DESC 
        LIMIT ? OFFSET ?
      `;
      
      this.db.all(sql, [formId, limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const submissions = rows.map(row => ({
            ...row,
            data: JSON.parse(row.data),
          }));
          resolve(submissions);
        }
      });
    });
  }

  async getAllSubmissions(formId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, formId, data, submittedAt
        FROM submissions 
        WHERE formId = ?
        ORDER BY submittedAt DESC
      `;
      
      this.db.all(sql, [formId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const submissions = rows.map(row => ({
            ...row,
            data: JSON.parse(row.data),
          }));
          resolve(submissions);
        }
      });
    });
  }

  async getSubmissionsCount(formId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM submissions WHERE formId = ?',
        [formId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count);
          }
        }
      );
    });
  }

  async deleteSubmission(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM submissions WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  // Analytics methods
  async getFormAnalytics(formId, period = '30d') {
    return new Promise((resolve, reject) => {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const sql = `
        SELECT 
          COUNT(*) as totalSubmissions,
          DATE(submittedAt) as date
        FROM submissions 
        WHERE formId = ? AND submittedAt >= ?
        GROUP BY DATE(submittedAt)
        ORDER BY date
      `;
      
      this.db.all(sql, [formId, startDate.toISOString()], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            totalSubmissions: rows.reduce((sum, row) => sum + row.totalSubmissions, 0),
            dailyStats: rows,
          });
        }
      });
    });
  }

  async getDashboardStats() {
    return new Promise((resolve, reject) => {
      const queries = [
        'SELECT COUNT(*) as totalForms FROM forms',
        'SELECT COUNT(*) as publishedForms FROM forms WHERE isPublished = 1',
        'SELECT COUNT(*) as totalSubmissions FROM submissions',
        'SELECT COUNT(*) as submissionsToday FROM submissions WHERE DATE(submittedAt) = DATE("now")',
      ];

      Promise.all(queries.map(sql => 
        new Promise((resolveQuery, rejectQuery) => {
          this.db.get(sql, (err, row) => {
            if (err) rejectQuery(err);
            else resolveQuery(row);
          });
        })
      )).then(results => {
        resolve({
          totalForms: results[0].totalForms,
          publishedForms: results[1].publishedForms,
          totalSubmissions: results[2].totalSubmissions,
          submissionsToday: results[3].submissionsToday,
        });
      }).catch(reject);
    });
  }

  // Close database connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

export default Database;