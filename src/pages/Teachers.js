import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api';
import { Search, Trash2, Users, AlertTriangle } from 'lucide-react';

const empty = { name: '', employeeId: '', subject: '', age: '', gender: '', phone: '' };

function validate(form) {
  const errors = {};
  if (!form.name.trim())                           errors.name       = 'Name is required';
  if (!form.employeeId.trim())                     errors.employeeId = 'Employee ID is required';
  if (!form.subject.trim())                        errors.subject    = 'Subject is required';
  if (!form.age || form.age < 21 || form.age > 70) errors.age        = 'Enter valid age (21–70)';
  if (!form.gender)                                errors.gender     = 'Select gender';
  if (form.phone && !/^\d{10}$/.test(form.phone))  errors.phone      = 'Phone must be 10 digits';
  return errors;
}

export default function Teachers() {
  const [teachers, setTeachers]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(empty);
  const [errors, setErrors]       = useState({});
  const [search, setSearch]       = useState('');
  const [apiError, setApiError]   = useState('');

  const fetchTeachers = async () => {
    const { data } = await API.get('/teachers');
    setTeachers(data);
  };

  useEffect(() => { fetchTeachers(); }, []);

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
      await API.post('/teachers', form);
      setShowModal(false);
      setForm(empty);
      setErrors({});
      fetchTeachers();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to add teacher');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    await API.delete(`/teachers/${id}`);
    fetchTeachers();
  };

  const closeModal = () => { setShowModal(false); setForm(empty); setErrors({}); setApiError(''); };

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Teachers">
      <div className="page-header">
        <div>
          <h1>Teachers</h1>
          <p>{teachers.length} total teachers on staff</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Teacher</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <input placeholder="Search by name or subject..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Employee ID</th><th>Subject</th><th>Age</th><th>Gender</th><th>Phone</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8"><div className="empty-state"><div className="empty-icon"><Users size={40} strokeWidth={1.2} /></div><p>No teachers found</p></div></td></tr>
              ) : filtered.map((t, i) => (
                <tr key={t._id}>
                  <td>{i + 1}</td>
                  <td><strong>{t.name}</strong></td>
                  <td><span className="badge badge-green">{t.employeeId}</span></td>
                  <td>{t.subject}</td>
                  <td>{t.age}</td>
                  <td><span className={`badge ${t.gender === 'Male' ? 'badge-blue' : 'badge-yellow'}`}>{t.gender}</span></td>
                  <td>{t.phone || '—'}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDelete(t._id)}><Trash2 size={14} /> Delete</button>
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
              <h2>Add New Teacher</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {apiError && <div className="error-msg"><AlertTriangle size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />{apiError}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Full Name *</label>
                  <input name="name" placeholder="Enter teacher name" value={form.name} onChange={handleChange} className={errors.name ? 'input-error' : ''} />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input name="employeeId" placeholder="e.g. TCH001" value={form.employeeId} onChange={handleChange} className={errors.employeeId ? 'input-error' : ''} />
                  {errors.employeeId && <span className="field-error">{errors.employeeId}</span>}
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <input name="subject" placeholder="e.g. Mathematics" value={form.subject} onChange={handleChange} className={errors.subject ? 'input-error' : ''} />
                  {errors.subject && <span className="field-error">{errors.subject}</span>}
                </div>
                <div className="form-group">
                  <label>Age *</label>
                  <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} className={errors.age ? 'input-error' : ''} />
                  {errors.age && <span className="field-error">{errors.age}</span>}
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className={errors.gender ? 'input-error' : ''}>
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                  {errors.gender && <span className="field-error">{errors.gender}</span>}
                </div>
                <div className="form-group full">
                  <label>Phone (Optional)</label>
                  <input name="phone" placeholder="10-digit number" value={form.phone} onChange={handleChange} className={errors.phone ? 'input-error' : ''} />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
