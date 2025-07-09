export function validateForm(form) {
  if (!form || typeof form !== 'object') {
    return { isValid: false, error: 'Form data is required' };
  }

  if (!form.title || typeof form.title !== 'string' || form.title.trim().length === 0) {
    return { isValid: false, error: 'Form title is required' };
  }

  if (form.title.length > 200) {
    return { isValid: false, error: 'Form title must be less than 200 characters' };
  }

  if (form.description && typeof form.description !== 'string') {
    return { isValid: false, error: 'Form description must be a string' };
  }

  if (form.description && form.description.length > 1000) {
    return { isValid: false, error: 'Form description must be less than 1000 characters' };
  }

  if (!Array.isArray(form.fields)) {
    return { isValid: false, error: 'Form fields must be an array' };
  }

  if (form.fields.length > 100) {
    return { isValid: false, error: 'Form cannot have more than 100 fields' };
  }

  // Validate each field
  for (let i = 0; i < form.fields.length; i++) {
    const field = form.fields[i];
    const fieldValidation = validateFormField(field, i);
    if (!fieldValidation.isValid) {
      return fieldValidation;
    }
  }

  // Validate settings
  if (form.settings && typeof form.settings !== 'object') {
    return { isValid: false, error: 'Form settings must be an object' };
  }

  return { isValid: true };
}

export function validateFormField(field, index) {
  if (!field || typeof field !== 'object') {
    return { isValid: false, error: `Field ${index + 1} is invalid` };
  }

  if (!field.id || typeof field.id !== 'string') {
    return { isValid: false, error: `Field ${index + 1} must have a valid ID` };
  }

  if (!field.type || typeof field.type !== 'string') {
    return { isValid: false, error: `Field ${index + 1} must have a valid type` };
  }

  const validTypes = [
    'text', 'email', 'number', 'textarea', 'select', 'radio', 
    'checkbox', 'date', 'file', 'phone', 'url', 'rating'
  ];

  if (!validTypes.includes(field.type)) {
    return { isValid: false, error: `Field ${index + 1} has an invalid type` };
  }

  if (!field.label || typeof field.label !== 'string' || field.label.trim().length === 0) {
    return { isValid: false, error: `Field ${index + 1} must have a label` };
  }

  if (field.label.length > 200) {
    return { isValid: false, error: `Field ${index + 1} label must be less than 200 characters` };
  }

  if (field.placeholder && typeof field.placeholder !== 'string') {
    return { isValid: false, error: `Field ${index + 1} placeholder must be a string` };
  }

  if (field.placeholder && field.placeholder.length > 200) {
    return { isValid: false, error: `Field ${index + 1} placeholder must be less than 200 characters` };
  }

  if (typeof field.required !== 'boolean') {
    return { isValid: false, error: `Field ${index + 1} required property must be a boolean` };
  }

  // Validate options for select, radio, checkbox fields
  if (['select', 'radio', 'checkbox'].includes(field.type)) {
    if (!Array.isArray(field.options)) {
      return { isValid: false, error: `Field ${index + 1} must have options array` };
    }

    if (field.options.length === 0) {
      return { isValid: false, error: `Field ${index + 1} must have at least one option` };
    }

    if (field.options.length > 50) {
      return { isValid: false, error: `Field ${index + 1} cannot have more than 50 options` };
    }

    for (let j = 0; j < field.options.length; j++) {
      if (typeof field.options[j] !== 'string' || field.options[j].trim().length === 0) {
        return { isValid: false, error: `Field ${index + 1} option ${j + 1} is invalid` };
      }
      if (field.options[j].length > 100) {
        return { isValid: false, error: `Field ${index + 1} option ${j + 1} must be less than 100 characters` };
      }
    }
  }

  return { isValid: true };
}

export function validateSubmission(submissionData, formFields) {
  if (!submissionData || typeof submissionData !== 'object') {
    return { isValid: false, error: 'Submission data is required' };
  }

  const fields = typeof formFields === 'string' ? JSON.parse(formFields) : formFields;

  if (!Array.isArray(fields)) {
    return { isValid: false, error: 'Invalid form fields' };
  }

  // Check required fields
  for (const field of fields) {
    if (field.required) {
      const value = submissionData[field.id];
      
      if (value === undefined || value === null || value === '') {
        return { isValid: false, error: `${field.label} is required` };
      }

      // For array fields (like checkbox), check if array is empty
      if (Array.isArray(value) && value.length === 0) {
        return { isValid: false, error: `${field.label} is required` };
      }
    }
  }

  // Validate field values
  for (const [fieldId, value] of Object.entries(submissionData)) {
    const field = fields.find(f => f.id === fieldId);
    
    if (!field) {
      continue; // Skip unknown fields
    }

    const fieldValidation = validateFieldValue(field, value);
    if (!fieldValidation.isValid) {
      return fieldValidation;
    }
  }

  return { isValid: true };
}

function validateFieldValue(field, value) {
  // Skip validation for empty non-required fields
  if (!field.required && (value === undefined || value === null || value === '')) {
    return { isValid: true };
  }

  switch (field.type) {
    case 'email':
      if (typeof value !== 'string') {
        return { isValid: false, error: `${field.label} must be a string` };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, error: `${field.label} must be a valid email address` };
      }
      break;

    case 'number':
      if (typeof value !== 'number' && typeof value !== 'string') {
        return { isValid: false, error: `${field.label} must be a number` };
      }
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { isValid: false, error: `${field.label} must be a valid number` };
      }
      break;

    case 'url':
      if (typeof value !== 'string') {
        return { isValid: false, error: `${field.label} must be a string` };
      }
      try {
        new URL(value);
      } catch {
        return { isValid: false, error: `${field.label} must be a valid URL` };
      }
      break;

    case 'phone':
      if (typeof value !== 'string') {
        return { isValid: false, error: `${field.label} must be a string` };
      }
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return { isValid: false, error: `${field.label} must be a valid phone number` };
      }
      break;

    case 'date':
      if (typeof value !== 'string') {
        return { isValid: false, error: `${field.label} must be a string` };
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { isValid: false, error: `${field.label} must be a valid date` };
      }
      break;

    case 'select':
    case 'radio':
      if (typeof value !== 'string') {
        return { isValid: false, error: `${field.label} must be a string` };
      }
      if (field.options && !field.options.includes(value)) {
        return { isValid: false, error: `${field.label} has an invalid option` };
      }
      break;

    case 'checkbox':
      if (!Array.isArray(value)) {
        return { isValid: false, error: `${field.label} must be an array` };
      }
      if (field.options) {
        for (const selectedValue of value) {
          if (!field.options.includes(selectedValue)) {
            return { isValid: false, error: `${field.label} has an invalid option` };
          }
        }
      }
      break;

    case 'text':
    case 'textarea':
      if (typeof value !== 'string') {
        return { isValid: false, error: `${field.label} must be a string` };
      }
      if (value.length > 5000) {
        return { isValid: false, error: `${field.label} must be less than 5000 characters` };
      }
      break;

    case 'rating':
      if (typeof value !== 'number' && typeof value !== 'string') {
        return { isValid: false, error: `${field.label} must be a number` };
      }
      const rating = Number(value);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return { isValid: false, error: `${field.label} must be a rating between 1 and 5` };
      }
      break;

    default:
      // For other field types, just check if it's not too long if it's a string
      if (typeof value === 'string' && value.length > 5000) {
        return { isValid: false, error: `${field.label} must be less than 5000 characters` };
      }
  }

  return { isValid: true };
}