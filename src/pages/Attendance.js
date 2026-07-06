import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api';
import { ClipboardList, Calendar, GraduationCap, CheckCircle2, XCircle, Clock, Save } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const AVATAR = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=fff&size=36&bold=true&rounded=true`;

export default function Attendance() {
  const [students, setStudents]     = useState([]);
  const [date, setDate]             = useState(today);
  const [records, setRecords]       = useState({}); // { studentId: status }
  const [saved, setSaved]           = useState(false);
  const [loading, setLoading]       = useState(false);
  const [viewDate, setViewDate]     = useState(today);
  const [viewRecords, setViewRecords] = useState([]);

  // Load all students
  useEffect(() => {
    API.get('/students').then(({ data }) => {
      setStudents(data);
      const init = {};
      data.forEach(s => { init[s._id] = 'Present'; });
      setRecords(init);
    });
  }, []);

  // Load existing attendance for selected mark date
  useEffect(() => {
    if (!date) return;
    API.get(`/attendance?date=${date}`).then(({ data }) => {
      const map = {};
      data.forEach(r => { map[r.student._id] = r.status; });
      setStudents(prev => {
        const init = {};
        prev.forEach(s => { init[s._id] = map[s._id] || 'Present'; });
        setRecords(init);
        return prev;
      });
    });
  }, [date]);

  // Load view records
  useEffect(() => {
    if (!viewDate) return;
    API.get(`/attendance?date=${viewDate}`).then(({ data }) => setViewRecords(data));
  }, [viewDate]);

  const handleStatusChange = (id, status) => {
    setRecords(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    if (!date) return;
    setLoading(true);
    const payload = students.map(s => ({ studentId: s._id, status: records[s._id] || 'Present' }));
    await API.post('/attendance/mark', { date, records: payload });
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2500);
    // refresh view
    API.get(`/attendance?date=${viewDate}`).then(({ data }) => setViewRecords(data));
  };

  const statusColor = (s) => s === 'Present' ? 'badge-green' : s === 'Absent' ? 'badge-red' : 'badge-yellow';

  const summary = viewRecords.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
    { Present: 0, Absent: 0, Late: 0 }
  );

  return (
    <Layout title="Attendance">
      <div className="page-header">
        <div><h1>Attendance</h1><p>Mark and view daily student attendance</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Mark Attendance */}
        <div className="card">
          <div className="card-header">
            <h3><ClipboardList size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Mark Attendance</h3>
            <input
              type="date" value={date}
              onChange={e => setDate(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
            />
          </div>

          {saved && <div className="success-msg"><CheckCircle2 size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Attendance saved successfully!</div>}

          {students.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><GraduationCap size={40} strokeWidth={1.2} /></div><p>No students found. Add students first.</p></div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>#</th><th>Student</th><th>Roll No</th><th>Class</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s._id}>
                        <td>{i + 1}</td>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {s.photo
                            ? <img src={`http://localhost:5000${s.photo}`} alt="" className="student-photo" />
                            : <div className="photo-placeholder"><GraduationCap size={18} strokeWidth={1.5} /></div>}
                          <strong>{s.name}</strong>
                        </td>
                        <td><span className="badge badge-blue">{s.rollNumber}</span></td>
                        <td>{s.class}</td>
                        <td>
                          <select
                            className="attendance-status-select"
                            value={records[s._id] || 'Present'}
                            onChange={e => handleStatusChange(s._id, e.target.value)}
                          >
                            <option>Present</option>
                            <option>Absent</option>
                            <option>Late</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : <><Save size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Save Attendance</>}
                </button>
              </div>
            </>
          )}
        </div>

        {/* View Attendance */}
        <div className="card">
          <div className="card-header">
            <h3><Calendar size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />View Attendance</h3>
            <input
              type="date" value={viewDate}
              onChange={e => setViewDate(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
            />
          </div>

          {/* Summary badges */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span className="badge badge-green"><CheckCircle2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Present: {summary.Present}</span>
            <span className="badge badge-red"><XCircle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Absent: {summary.Absent}</span>
            <span className="badge badge-yellow"><Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Late: {summary.Late}</span>
          </div>

          {viewRecords.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><ClipboardList size={40} strokeWidth={1.2} /></div><p>No attendance for this date</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>#</th><th>Student</th><th>Class</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {viewRecords.map((r, i) => (
                    <tr key={r._id}>
                      <td>{i + 1}</td>
                      <td><strong>{r.student?.name}</strong></td>
                      <td>{r.student?.class}</td>
                      <td><span className={`badge ${statusColor(r.status)}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
