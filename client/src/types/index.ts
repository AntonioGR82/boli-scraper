export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: FieldValidation;
  description?: string;
  order: number;
}

export type FieldType = 
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'phone'
  | 'url'
  | 'rating';

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  submissionCount: number;
}

export interface FormSettings {
  allowMultipleSubmissions: boolean;
  requireAuth: boolean;
  showProgressBar: boolean;
  submitButtonText: string;
  successMessage: string;
  redirectUrl?: string;
  theme: FormTheme;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
  ip?: string;
  userAgent?: string;
}

export interface FormResponse {
  fieldId: string;
  value: any;
  label: string;
}

export interface DragItem {
  id: string;
  type: string;
  index: number;
}

export interface FieldTypeDefinition {
  type: FieldType;
  label: string;
  icon: string;
  defaultProps: Partial<FormField>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Builder Context Types
export interface FormBuilderState {
  currentForm: Form | null;
  selectedFieldId: string | null;
  isPreviewMode: boolean;
  isDirty: boolean;
}

export interface FormBuilderActions {
  setCurrentForm: (form: Form | null) => void;
  addField: (field: FormField) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (fieldId: string) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  selectField: (fieldId: string | null) => void;
  togglePreview: () => void;
  saveForm: () => Promise<void>;
  publishForm: () => Promise<void>;
}