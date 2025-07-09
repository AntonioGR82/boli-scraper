import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Save, 
  Eye, 
  Settings, 
  Plus,
  Trash2,
  GripVertical,
  Type,
  Mail,
  Hash,
  Calendar,
  List,
  FileText,
  Phone,
  Link as LinkIcon,
  Star
} from 'lucide-react';
import { useFormBuilder } from '../contexts/FormBuilderContext';
import { Form, FormField, FieldType } from '../types';
import { formApi } from '../api';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const fieldTypes = [
  { type: 'text' as FieldType, label: 'Text', icon: Type },
  { type: 'email' as FieldType, label: 'Email', icon: Mail },
  { type: 'number' as FieldType, label: 'Number', icon: Hash },
  { type: 'textarea' as FieldType, label: 'Textarea', icon: FileText },
  { type: 'select' as FieldType, label: 'Select', icon: List },
  { type: 'radio' as FieldType, label: 'Radio', icon: List },
  { type: 'checkbox' as FieldType, label: 'Checkbox', icon: List },
  { type: 'date' as FieldType, label: 'Date', icon: Calendar },
  { type: 'phone' as FieldType, label: 'Phone', icon: Phone },
  { type: 'url' as FieldType, label: 'URL', icon: LinkIcon },
  { type: 'rating' as FieldType, label: 'Rating', icon: Star },
];

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentForm,
    selectedFieldId,
    isPreviewMode,
    isDirty,
    setCurrentForm,
    addField,
    updateField,
    deleteField,
    reorderFields,
    selectField,
    togglePreview,
    saveForm,
    publishForm,
  } = useFormBuilder();

  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      loadForm();
    } else {
      // Create new form
      const newForm: Form = {
        id: '',
        title: 'Untitled Form',
        description: '',
        fields: [],
        settings: {
          allowMultipleSubmissions: true,
          requireAuth: false,
          showProgressBar: true,
          submitButtonText: 'Submit',
          successMessage: 'Thank you for your submission!',
          theme: {
            primaryColor: '#0ea5e9',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            fontFamily: 'Inter',
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublished: false,
        submissionCount: 0,
      };
      setCurrentForm(newForm);
    }
  }, [id]);

  const loadForm = async () => {
    if (!id) return;
    
    try {
      const form = await formApi.getForm(id);
      setCurrentForm(form);
    } catch (error) {
      console.error('Error loading form:', error);
      toast.error('Failed to load form');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = (fieldType: FieldType) => {
    const newField: FormField = {
      id: uuidv4(),
      type: fieldType,
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: '',
      required: false,
      options: fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox' 
        ? ['Option 1', 'Option 2'] 
        : undefined,
      order: currentForm?.fields.length || 0,
    };
    
    addField(newField);
    selectField(newField.id);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    reorderFields(result.source.index, result.destination.index);
  };

  const handleSave = async () => {
    await saveForm();
    if (!id && currentForm?.id) {
      navigate(`/forms/${currentForm.id}/edit`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!currentForm) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={currentForm.title}
                onChange={(e) => updateField('title', { title: e.target.value } as any)}
                className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0"
                placeholder="Form Title"
              />
              {isDirty && <span className="text-orange-500 text-sm">• Unsaved</span>}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePreview}
                className={`btn-secondary ${isPreviewMode ? 'bg-primary-50 text-primary-600' : ''}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              
              <button onClick={handleSave} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              
              {currentForm.id && (
                <button
                  onClick={publishForm}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentForm.isPublished
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {currentForm.isPublished ? 'Published' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Fields</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {fieldTypes.map((fieldType) => (
                  <button
                    key={fieldType.type}
                    onClick={() => handleAddField(fieldType.type)}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <fieldType.icon className="w-5 h-5 text-gray-600 mb-2" />
                    <div className="text-sm font-medium text-gray-900">{fieldType.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            {/* Form Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentForm.title}</h1>
              {currentForm.description && (
                <p className="text-gray-600">{currentForm.description}</p>
              )}
            </div>

            {/* Form Fields */}
            {currentForm.fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start building your form</h3>
                <p className="text-gray-600">Add fields from the sidebar to get started</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="form-fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {currentForm.fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`field-container mb-4 ${
                                selectedFieldId === field.id ? 'selected' : ''
                              } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                              onClick={() => selectField(field.id)}
                            >
                              <div className="flex items-start space-x-3">
                                {!isPreviewMode && (
                                  <div
                                    {...provided.dragHandleProps}
                                    className="drag-handle mt-1 p-1"
                                  >
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                
                                <div className="flex-1">
                                  <FormFieldRenderer field={field} isPreview={isPreviewMode} />
                                </div>
                                
                                {!isPreviewMode && selectedFieldId === field.id && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteField(field.id);
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                disabled
              >
                {currentForm.settings.submitButtonText}
              </button>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {!isPreviewMode && selectedFieldId && (
          <div className="w-80 bg-white border-l border-gray-200 min-h-screen">
            <FieldPropertiesPanel />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components
function FormFieldRenderer({ field, isPreview }: { field: FormField; isPreview: boolean }) {
  const { updateField } = useFormBuilder();

  const handleLabelChange = (label: string) => {
    updateField(field.id, { label });
  };

  const handlePlaceholderChange = (placeholder: string) => {
    updateField(field.id, { placeholder });
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {isPreview ? (
          field.label
        ) : (
          <input
            type="text"
            value={field.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none font-medium"
            placeholder="Field label"
          />
        )}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Render field based on type */}
      <div>
        {field.type === 'text' && (
          <input
            type="text"
            placeholder={isPreview ? field.placeholder : 'Enter placeholder...'}
            className="form-input w-full"
            disabled={!isPreview}
            onChange={isPreview ? undefined : (e) => handlePlaceholderChange(e.target.value)}
          />
        )}
        
        {field.type === 'email' && (
          <input
            type="email"
            placeholder={isPreview ? field.placeholder : 'Enter placeholder...'}
            className="form-input w-full"
            disabled={!isPreview}
          />
        )}
        
        {field.type === 'textarea' && (
          <textarea
            rows={3}
            placeholder={isPreview ? field.placeholder : 'Enter placeholder...'}
            className="form-input w-full"
            disabled={!isPreview}
          />
        )}
        
        {(field.type === 'select' || field.type === 'radio') && field.options && (
          <div>
            {field.type === 'select' ? (
              <select className="form-input w-full" disabled={!isPreview}>
                <option value="">Choose an option</option>
                {field.options.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                {field.options.map((option, index) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="radio"
                      name={field.id}
                      value={option}
                      className="mr-2"
                      disabled={!isPreview}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Add other field types as needed */}
      </div>
    </div>
  );
}

function FieldPropertiesPanel() {
  const { currentForm, selectedFieldId, updateField } = useFormBuilder();
  
  if (!currentForm || !selectedFieldId) return null;
  
  const selectedField = currentForm.fields.find(f => f.id === selectedFieldId);
  if (!selectedField) return null;

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={selectedField.label}
            onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
            className="form-input w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={selectedField.placeholder || ''}
            onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
            className="form-input w-full"
          />
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedField.required}
              onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Required</span>
          </label>
        </div>
        
        {(selectedField.type === 'select' || selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options
            </label>
            <div className="space-y-2">
              {selectedField.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(selectedField.options || [])];
                      newOptions[index] = e.target.value;
                      updateField(selectedField.id, { options: newOptions });
                    }}
                    className="form-input flex-1"
                  />
                  <button
                    onClick={() => {
                      const newOptions = selectedField.options?.filter((_, i) => i !== index);
                      updateField(selectedField.id, { options: newOptions });
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`];
                  updateField(selectedField.id, { options: newOptions });
                }}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Option
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}