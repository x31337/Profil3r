import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function ReportView() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Get report ID from URL

  useEffect(() => {
    if (id) {
      axios.get(`/api/reports/${id}`)
        .then(response => {
          setReport(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(`Error fetching report ${id}:`, err);
          setError(`Failed to fetch report ${id}.`);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <p>Loading report details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!report) return <p>Report not found.</p>;

  return (
    <div>
      <h2>Report Details</h2>
      <p><strong>ID:</strong> {report._id}</p>
      <p><strong>Title:</strong> {report.title}</p>
      <p><strong>Description:</strong> {report.description}</p>
      <p><strong>Status:</strong> {report.status}</p>
      <p><strong>Date Created:</strong> {new Date(report.date).toLocaleDateString()}</p>
      <br />
      <Link to="/reports">Back to All Reports</Link>
      {/* TODO: Add links/buttons for Edit and Delete functionality here */}
    </div>
  );
}

export default ReportView;
