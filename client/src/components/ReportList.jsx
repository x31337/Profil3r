import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('/api/reports') // Using a proxy, will configure this in vite.config.js
      .then(response => {
        setReports(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports. Is the backend server running?');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
            <h2>All Reports</h2>

      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <ul>

          {reports.map(report => (
            <li key={report._id}>

              <Link to={`/reports/${report._id}`}>{report.title}</Link>
                            <p>{report.description}</p>
                            <p>Status: {report.status}</p>

            </li>
          ))}

        </ul>
      )}

    </div>
  );
}

export default ReportList;
