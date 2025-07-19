import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ReportList from './components/ReportList.jsx';
import ReportForm from './components/ReportForm.jsx';
import ReportView from './components/ReportView.jsx';
import './App.css';

function App() {
  return (
    <div>

      <nav>

        <ul>

          <li>
                        <Link to='/'>Home</Link>

          </li>

          <li>
                        <Link to='/reports'>All Reports</Link>

          </li>

          <li>
                        <Link to='/reports/new'>New Report</Link>

          </li>

        </ul>

      </nav>

      <main>

        <Routes>

          <Route path='/' element={<Home />} />

          <Route path='/reports' element={<ReportList />} />

          <Route path='/reports/new' element={<ReportForm />} />

          <Route path='/reports/:id' element={<ReportView />} />

        </Routes>

      </main>

    </div>
  );
}

function Home() {
  return <h1>Welcome to the Meta MAS Reporter</h1>;
}

export default App;
