import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api';
import { Trash2, BookOpen, AlertTriangle } from 'lucide-react';

const empty = { className: '', section: '', teacher: '', capacity: '' };

function validate(form) {
  const errors = {};
  if (!form.className.trim())                          errors.className = 'Class name is required';
  if (!form.section.trim())                            errors.section   = 'Section is required';
  if (!form.teacher.trim())                            errors.teacher   = 'Teacher name is required';
  if (!form.capacity || form.capacity < 1 || form.capacity > 100) errors.capacity = 'Capacity must be 1–100';
  return errors;
}

export default function Classes() {
  const [classes, setClasses]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(empty);
  const [errors, setErrors]       = useState({});
  const [apiError, setApiError]   = useState('');

  const fetchClasses = async () => {
    const { data } = await API.get('/classes');
    setClasses(data);
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (errors[e.target.name]) {
      const newErrors = { ...errors };
      delete newErrors[e.target.name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setApiError('');
    try {
      await API.post('/classes', form);
      setShowModal(false);
      setForm(empty);
      setErrors({});
      fetchClasses();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to add class');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    await API.delete(`/classes/${id}`);
    fetchClasses();
  };

  const closeModal = () => { setShowModal(false); setForm(empty); setErrors({}); setApiError(''); };

  return (
    <Layout title="Classes">
      <div className="page-header">
        <div>
          <h1>Classes</h1>
          <p>{classes.length} total classes available</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Class</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>#</th><th>Class Name</th><th>Section</th><th>Class Teacher</th><th>Capacity</th><th>Action</th></tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon"><BookOpen size={40} strokeWidth={1.2} /></div><p>No classes found</p></div></td></tr>
              ) : classes.map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>
                  <td><strong>Class {c.className}</strong></td>
                  <td><span className="badge badge-yellow">Section {c.section}</span></td>
                  <td>{c.teacher}</td>
                  <td><span className="badge badge-green">{c.capacity} seats</span></td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDelete(c._id)}><Trash2 size={14} /> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Class</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {apiError && <div className="error-msg"><AlertTriangle size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />{apiError}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label>Class Name *</label>
                  <input name="className" placeholder="e.g. 10" value={form.className} onChange={handleChange} className={errors.className ? 'input-error' : ''} />
                  {errors.className && <span className="field-error">{errors.className}</span>}
                </div>
                <div className="form-group">
                  <label>Section *</label>
                  <input name="section" placeholder="e.g. A" value={form.section} onChange={handleChange} className={errors.section ? 'input-error' : ''} />
                  {errors.section && <span className="field-error">{errors.section}</span>}
                </div>
                <div className="form-group full">
                  <label>Class Teacher *</label>
                  <input name="teacher" placeholder="Teacher name" value={form.teacher} onChange={handleChange} className={errors.teacher ? 'input-error' : ''} />
                  {errors.teacher && <span className="field-error">{errors.teacher}</span>}
                </div>
                <div className="form-group full">
                  <label>Capacity *</label>
                  <input name="capacity" type="number" placeholder="Max students (1–100)" value={form.capacity} onChange={handleChange} className={errors.capacity ? 'input-error' : ''} />
                  {errors.capacity && <span className="field-error">{errors.capacity}</span>}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
