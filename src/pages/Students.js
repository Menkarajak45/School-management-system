import React, { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import API from '../api';
import { Search, Camera, Trash2, GraduationCap, UserCircle, AlertTriangle } from 'lucide-react';

const empty = { name: '', rollNumber: '', class: '', age: '', gender: '', phone: '' };

function validate(form) {
  const errors = {};
  if (!form.name.trim())                          errors.name       = 'Name is required';
  if (!form.rollNumber.trim())                    errors.rollNumber = 'Roll number is required';
  if (!form.class.trim())                         errors.class      = 'Class is required';
  if (!form.age || form.age < 3 || form.age > 25) errors.age        = 'Enter valid age (3–25)';
  if (!form.gender)                               errors.gender     = 'Select gender';
  if (form.phone && !/^\d{10}$/.test(form.phone)) errors.phone      = 'Phone must be 10 digits';
  return errors;
}

export default function Students() {
  const [students, setStudents]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(empty);
  const [errors, setErrors]       = useState({});
  const [search, setSearch]       = useState('');
  const [apiError, setApiError]   = useState('');
  const [photoModal, setPhotoModal] = useState(null); // student object
  const [photoFile, setPhotoFile]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const fileRef = useRef();

  const fetchStudents = async () => {
    const { data } = await API.get('/students');
    setStudents(data);
  };

  useEffect(() => { fetchStudents(); }, []);

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
      await API.post('/students', form);
      setShowModal(false);
      setForm(empty);
      setErrors({});
      fetchStudents();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to add student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await API.delete(`/students/${id}`);
    fetchStudents();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    const fd = new FormData();
    fd.append('photo', photoFile);
    await API.put(`/students/${photoModal._id}/photo`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setPhotoModal(null);
    setPhotoFile(null);
    setPhotoPreview('');
    fetchStudents();
  };

  const closeModal = () => { setShowModal(false); setForm(empty); setErrors({}); setApiError(''); };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Students">
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>{students.length} total students enrolled</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Student</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <input
            placeholder="Search by name or roll number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Photo</th><th>Name</th><th>Roll No</th>
                <th>Class</th><th>Age</th><th>Gender</th><th>Phone</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9">
                  <div className="empty-state"><div className="empty-icon"><GraduationCap size={40} strokeWidth={1.2} /></div><p>No students found</p></div>
                </td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s._id}>
                  <td>{i + 1}</td>
                  <td>
                    {s.photo
                      ? <img src={`http://localhost:5000${s.photo}`} alt="" className="student-photo" />
                      : <div className="photo-placeholder"><UserCircle size={28} strokeWidth={1.2} /></div>}
                  </td>
                  <td><strong>{s.name}</strong></td>
                  <td><span className="badge badge-blue">{s.rollNumber}</span></td>
                  <td>{s.class}</td>
                  <td>{s.age}</td>
                  <td><span className={`badge ${s.gender === 'Male' ? 'badge-blue' : 'badge-yellow'}`}>{s.gender}</span></td>
                  <td>{s.phone || '—'}</td>
                  <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }}
                      onClick={() => { setPhotoModal(s); setPhotoPreview(s.photo ? `http://localhost:5000${s.photo}` : ''); }}>
                      <Camera size={14} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleDelete(s._id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {apiError && <div className="error-msg"><AlertTriangle size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />{apiError}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Full Name *</label>
                  <input name="name" placeholder="Enter student name" value={form.name} onChange={handleChange} className={errors.name ? 'input-error' : ''} />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Roll Number *</label>
                  <input name="rollNumber" placeholder="e.g. STU001" value={form.rollNumber} onChange={handleChange} className={errors.rollNumber ? 'input-error' : ''} />
                  {errors.rollNumber && <span className="field-error">{errors.rollNumber}</span>}
                </div>
                <div className="form-group">
                  <label>Class *</label>
                  <input name="class" placeholder="e.g. 10-A" value={form.class} onChange={handleChange} className={errors.class ? 'input-error' : ''} />
                  {errors.class && <span className="field-error">{errors.class}</span>}
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
                <button type="submit" className="btn btn-primary">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {photoModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '360px' }}>
            <div className="modal-header">
              <h2>Update Photo — {photoModal.name}</h2>
              <button className="modal-close" onClick={() => { setPhotoModal(null); setPhotoFile(null); setPhotoPreview(''); }}>×</button>
            </div>
            <div className="photo-upload-area" onClick={() => fileRef.current.click()}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" className="photo-preview" />
                : <div style={{ fontSize: '48px' }}><Camera size={48} strokeWidth={1.2} /></div>}
              <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>Click to select photo (JPG/PNG, max 2MB)</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => { setPhotoModal(null); setPhotoFile(null); setPhotoPreview(''); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePhotoUpload} disabled={!photoFile}>Upload Photo</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
