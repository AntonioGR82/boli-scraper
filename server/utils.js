export function exportToCsv(submissions, formFields) {
  if (!submissions || submissions.length === 0) {
    return 'No submissions to export\n';
  }

  const fields = typeof formFields === 'string' ? JSON.parse(formFields) : formFields;
  
  // Get all unique field IDs from submissions
  const allFieldIds = new Set();
  submissions.forEach(submission => {
    Object.keys(submission.data).forEach(fieldId => {
      allFieldIds.add(fieldId);
    });
  });

  // Create headers
  const headers = ['Submitted At'];
  
  // Add field labels as headers
  allFieldIds.forEach(fieldId => {
    const field = fields.find(f => f.id === fieldId);
    const label = field ? field.label : fieldId;
    headers.push(label);
  });

  // Add IP and User Agent if available
  if (submissions.some(s => s.ip)) {
    headers.push('IP Address');
  }
  if (submissions.some(s => s.userAgent)) {
    headers.push('User Agent');
  }

  // Create CSV content
  let csvContent = headers.map(header => `"${escapeCSV(header)}"`).join(',') + '\n';

  // Add data rows
  submissions.forEach(submission => {
    const row = [];
    
    // Add submission date
    row.push(`"${escapeCSV(new Date(submission.submittedAt).toLocaleString())}"`);
    
    // Add field values
    allFieldIds.forEach(fieldId => {
      const value = submission.data[fieldId];
      let formattedValue = '';
      
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formattedValue = value.join(', ');
        } else {
          formattedValue = String(value);
        }
      }
      
      row.push(`"${escapeCSV(formattedValue)}"`);
    });

    // Add IP and User Agent if they exist
    if (submissions.some(s => s.ip)) {
      row.push(`"${escapeCSV(submission.ip || '')}"`);
    }
    if (submissions.some(s => s.userAgent)) {
      row.push(`"${escapeCSV(submission.userAgent || '')}"`);
    }

    csvContent += row.join(',') + '\n';
  });

  return csvContent;
}

function escapeCSV(value) {
  if (typeof value !== 'string') {
    value = String(value);
  }
  
  // Escape double quotes by doubling them
  return value.replace(/"/g, '""');
}

export function sanitizeFilename(filename) {
  // Remove or replace invalid characters for filenames
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 255);
}

export function generateFormUrl(formId, baseUrl = '') {
  return `${baseUrl}/form/${formId}`;
}

export function parseUserAgent(userAgent) {
  if (!userAgent) return null;
  
  const browserPatterns = [
    { name: 'Chrome', pattern: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', pattern: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', pattern: /Version\/([0-9.]+).*Safari/ },
    { name: 'Edge', pattern: /Edge\/([0-9.]+)/ },
    { name: 'Opera', pattern: /Opera\/([0-9.]+)/ },
  ];

  for (const browser of browserPatterns) {
    const match = userAgent.match(browser.pattern);
    if (match) {
      return {
        name: browser.name,
        version: match[1],
      };
    }
  }

  return { name: 'Unknown', version: 'Unknown' };
}

export function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function truncateText(text, maxLength) {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getDateRange(period) {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 30);
  }

  return {
    start: startDate.toISOString(),
    end: now.toISOString(),
  };
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function rateLimitKey(ip, endpoint) {
  return `${ip}:${endpoint}`;
}

export function hashString(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash;
}