import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Form } from '../types';
import { formApi, submissionApi } from '../api';
import toast from 'react-hot-toast';

export default function FormView() {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    if (!id) return;
    
    try {
      const formData = await formApi.getForm(id);
      if (!formData.isPublished) {
        toast.error('This form is not published');
        return;
      }
      setForm(formData);
    } catch (error) {
      console.error('Error loading form:', error);
      toast.error('Form not found');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!form) return;
    
    setSubmitting(true);
    try {
      await submissionApi.submitForm(form.id, data);
      setSubmitted(true);
      toast.success(form.settings.successMessage);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">This form does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-gray-600">{form.settings.successMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600 text-lg">{form.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    {...register(field.id, { required: field.required })}
                    placeholder={field.placeholder}
                    className="form-input w-full"
                  />
                )}

                {field.type === 'email' && (
                  <input
                    type="email"
                    {...register(field.id, { 
                      required: field.required,
                      pattern: /^\S+@\S+$/i
                    })}
                    placeholder={field.placeholder}
                    className="form-input w-full"
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    rows={3}
                    {...register(field.id, { required: field.required })}
                    placeholder={field.placeholder}
                    className="form-input w-full"
                  />
                )}

                {field.type === 'select' && field.options && (
                  <select
                    {...register(field.id, { required: field.required })}
                    className="form-input w-full"
                  >
                    <option value="">Choose an option</option>
                    {field.options.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && field.options && (
                  <div className="space-y-2">
                    {field.options.map((option, index) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="radio"
                          {...register(field.id, { required: field.required })}
                          value={option}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {errors[field.id] && (
                  <p className="text-red-500 text-sm mt-1">This field is required</p>
                )}
              </div>
            ))}

            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? 'Submitting...' : form.settings.submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}