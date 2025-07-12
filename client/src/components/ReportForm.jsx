import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ReportForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('open'); // Default status
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !description) {
      setError('Title and Description are required.');
      return;
    }

    try {
      const response = await axios.post('/api/reports', { title, description, status });
      setSuccess(`Report "${response.data.title}" created successfully!`);
      setTitle('');
      setDescription('');
      setStatus('open');
      // Optionally navigate away or show a success message
      // navigate('/reports');
      // For now, just clear form and show message
    } catch (err) {
      console.error("Error creating report:", err);
      setError(err.response?.data?.message || 'Failed to create report.');
    }
  };

  return (
    <div>
      <h2>Create Report</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button type="submit">Create Report</button>
      </form>
    </div>
  );
}

export default ReportForm;
