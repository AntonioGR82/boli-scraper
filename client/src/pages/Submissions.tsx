import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Calendar, User } from 'lucide-react';
import { FormSubmission } from '../types';
import { submissionApi } from '../api';
import toast from 'react-hot-toast';

export default function Submissions() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSubmissions();
    }
  }, [id]);

  const loadSubmissions = async () => {
    if (!id) return;
    
    try {
      const response = await submissionApi.getSubmissions(id);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    
    try {
      const blob = await submissionApi.exportSubmissions(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-submissions-${id}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Submissions exported successfully');
    } catch (error) {
      console.error('Error exporting submissions:', error);
      toast.error('Failed to export submissions');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Submissions</h1>
          <p className="text-gray-600 mt-2">{submissions.length} total submissions</p>
        </div>
        <button onClick={handleExport} className="btn-primary">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="card text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600">Submissions will appear here once people start filling out your form</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {Object.entries(submission.data).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium text-gray-700">{key}:</span>
                            <span className="ml-2 text-gray-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}