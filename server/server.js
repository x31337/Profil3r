const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
// The MONGO_URI will typically be 'mongodb://mongo:27017/reports' in a Docker environment
// For local development outside Docker, it might be 'mongodb://localhost:27017/reports'
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/metaMasReporterDB';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Meta MAS Reporter API is running!');
});

// Define Report Schema and Model
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    default: 'open',
    enum: ['open', 'in progress', 'closed']
  }
});

const Report = mongoose.model('Report', reportSchema);

// API Endpoints for Reports

// GET all reports
app.get('/reports', async(req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new report
app.post('/reports', async(req, res) => {
  const report = new Report({
    title: req.body.title,
    description: req.body.description,
    status: req.body.status // Optional, defaults to 'open'
  });
  try {
    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET a single report by ID
app.get('/reports/:id', getReport, (req, res) => {
  res.json(res.report);
});

// PUT (update) a report by ID
app.put('/reports/:id', getReport, async(req, res) => {
  if (req.body.title != null) {
    res.report.title = req.body.title;
  }
  if (req.body.description != null) {
    res.report.description = req.body.description;
  }
  if (req.body.status != null) {
    res.report.status = req.body.status;
  }
  try {
    const updatedReport = await res.report.save();
    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a report by ID
app.delete('/reports/:id', getReport, async(req, res) => {
  try {
    await res.report.deleteOne(); // Changed from res.report.remove() which is deprecated
    res.json({ message: 'Deleted Report' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get a report by ID
async function getReport(req, res, next) {
  let report;
  try {
    report = await Report.findById(req.params.id);
    if (report == null) {
      return res.status(404).json({ message: 'Cannot find report' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.report = report;
  next();
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
