import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Form, FormField, FormBuilderState, FormBuilderActions } from '../types';
import { formApi } from '../api';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

type FormBuilderAction =
  | { type: 'SET_FORM'; payload: Form | null }
  | { type: 'ADD_FIELD'; payload: FormField }
  | { type: 'UPDATE_FIELD'; payload: { fieldId: string; updates: Partial<FormField> } }
  | { type: 'DELETE_FIELD'; payload: string }
  | { type: 'REORDER_FIELDS'; payload: { startIndex: number; endIndex: number } }
  | { type: 'SELECT_FIELD'; payload: string | null }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'SET_DIRTY'; payload: boolean };

const initialState: FormBuilderState = {
  currentForm: null,
  selectedFieldId: null,
  isPreviewMode: false,
  isDirty: false,
};

function formBuilderReducer(state: FormBuilderState, action: FormBuilderAction): FormBuilderState {
  switch (action.type) {
    case 'SET_FORM':
      return { ...state, currentForm: action.payload, isDirty: false };
    
    case 'ADD_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: [...state.currentForm.fields, action.payload],
        },
        isDirty: true,
      };
    
    case 'UPDATE_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.map(field =>
            field.id === action.payload.fieldId
              ? { ...field, ...action.payload.updates }
              : field
          ),
        },
        isDirty: true,
      };
    
    case 'DELETE_FIELD':
      if (!state.currentForm) return state;
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: state.currentForm.fields.filter(field => field.id !== action.payload),
        },
        selectedFieldId: state.selectedFieldId === action.payload ? null : state.selectedFieldId,
        isDirty: true,
      };
    
    case 'REORDER_FIELDS':
      if (!state.currentForm) return state;
      const newFields = [...state.currentForm.fields];
      const [removed] = newFields.splice(action.payload.startIndex, 1);
      newFields.splice(action.payload.endIndex, 0, removed);
      
      // Update order property
      const reorderedFields = newFields.map((field, index) => ({
        ...field,
        order: index,
      }));
      
      return {
        ...state,
        currentForm: {
          ...state.currentForm,
          fields: reorderedFields,
        },
        isDirty: true,
      };
    
    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.payload };
    
    case 'TOGGLE_PREVIEW':
      return { ...state, isPreviewMode: !state.isPreviewMode };
    
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    
    default:
      return state;
  }
}

const FormBuilderContext = createContext<(FormBuilderState & FormBuilderActions) | null>(null);

export function FormBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);

  const actions: FormBuilderActions = {
    setCurrentForm: (form: Form | null) => {
      dispatch({ type: 'SET_FORM', payload: form });
    },

    addField: (field: FormField) => {
      dispatch({ type: 'ADD_FIELD', payload: field });
    },

    updateField: (fieldId: string, updates: Partial<FormField>) => {
      dispatch({ type: 'UPDATE_FIELD', payload: { fieldId, updates } });
    },

    deleteField: (fieldId: string) => {
      dispatch({ type: 'DELETE_FIELD', payload: fieldId });
    },

    reorderFields: (startIndex: number, endIndex: number) => {
      dispatch({ type: 'REORDER_FIELDS', payload: { startIndex, endIndex } });
    },

    selectField: (fieldId: string | null) => {
      dispatch({ type: 'SELECT_FIELD', payload: fieldId });
    },

    togglePreview: () => {
      dispatch({ type: 'TOGGLE_PREVIEW' });
    },

    saveForm: async () => {
      if (!state.currentForm) return;
      
      try {
        toast.loading('Saving form...', { id: 'save-form' });
        
        if (state.currentForm.id) {
          await formApi.updateForm(state.currentForm.id, state.currentForm);
        } else {
          const newForm = await formApi.createForm(state.currentForm);
          dispatch({ type: 'SET_FORM', payload: newForm });
        }
        
        dispatch({ type: 'SET_DIRTY', payload: false });
        toast.success('Form saved successfully!', { id: 'save-form' });
      } catch (error) {
        console.error('Error saving form:', error);
        toast.error('Failed to save form', { id: 'save-form' });
      }
    },

    publishForm: async () => {
      if (!state.currentForm) return;
      
      try {
        const updatedForm = await formApi.togglePublish(state.currentForm.id, !state.currentForm.isPublished);
        dispatch({ type: 'SET_FORM', payload: updatedForm });
        toast.success(
          updatedForm.isPublished ? 'Form published!' : 'Form unpublished!'
        );
      } catch (error) {
        console.error('Error publishing form:', error);
        toast.error('Failed to publish form');
      }
    },
  };

  return (
    <FormBuilderContext.Provider value={{ ...state, ...actions }}>
      {children}
    </FormBuilderContext.Provider>
  );
}

export function useFormBuilder() {
  const context = useContext(FormBuilderContext);
  if (!context) {
    throw new Error('useFormBuilder must be used within FormBuilderProvider');
  }
  return context;
}