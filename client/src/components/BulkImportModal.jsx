import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { bulkCreateUsers } from '../store/slices/usersSlice';
import { X } from 'lucide-react';

const BulkImportModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('json'); // 'json' or 'csv'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setFile(null); // Reset file when type changes
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let usersData = [];
      const reader = new FileReader();

      reader.onload = async (event) => {
        const content = event.target.result;
        if (fileType === 'json') {
          try {
            usersData = JSON.parse(content);
          } catch (parseError) {
            setError('Invalid JSON file format.');
            setLoading(false);
            return;
          }
        } else if (fileType === 'csv') {
          // Basic CSV parsing (you might want a more robust library for production)
          const lines = content.split('\n').filter(line => line.trim() !== '');
          if (lines.length === 0) {
            setError('CSV file is empty.');
            setLoading(false);
            return;
          }
          const headers = lines[0].split(',').map(h => h.trim());
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length === headers.length) {
              let user = {};
              headers.forEach((header, index) => {
                user[header] = values[index];
              });
              usersData.push(user);
            }
          }
        }

        if (usersData.length === 0) {
          setError('No valid user data found in the file.');
          setLoading(false);
          return;
        }

        const res = await dispatch(bulkCreateUsers(usersData));
        if (res.error) {
          setError(res.payload || 'Failed to bulk import users.');
        } else {
          setSuccess('Users imported successfully!');
          setFile(null);
          // Optionally, refresh user list in parent component
          // dispatch(getUsers()); 
        }
        setLoading(false);
      };

      reader.readAsText(file);

    } catch (err) {
      setError('An unexpected error occurred during file processing.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bulk Import Users</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">File Type</label>
            <select
              value={fileType}
              onChange={handleFileTypeChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload File ({fileType.toUpperCase()})</label>
            <input
              type="file"
              accept={fileType === 'json' ? '.json' : '.csv'}
              onChange={handleFileChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Import</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkImportModal;