import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    employeeCode: '', fullName: '', mobile: '', designation: '', email: '', company: '', isActive: true,
  });
  const [photo, setPhoto] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/employees`).then((r) => r.json()).then((list) => {
      const emp = list.find((e) => e.id === Number(id));
      if (emp) {
        setForm({
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
          mobile: emp.mobile,
          designation: emp.designation,
          email: emp.email || '',
          company: emp.company || '',
          isActive: emp.isActive,
        });
        setCurrentPhoto(emp.photoPath);
      }
    });
  }, [id, isEdit]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append('photograph', photo);
    try {
      await api.saveEmployee(isEdit ? id : null, fd);
      navigate('/employees');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="form-page">
      <h2>{isEdit ? 'Edit employee' : 'Add employee'}</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit} encType="multipart/form-data">
        <div className="mb-3">
          <label>Employee ID</label>
          <input required value={form.employeeCode} onChange={set('employeeCode')} />
        </div>
        <div className="mb-3">
          <label>Full name</label>
          <input required value={form.fullName} onChange={set('fullName')} />
        </div>
        <div className="mb-3">
          <label>Mobile number</label>
          <input required value={form.mobile} onChange={set('mobile')} />
        </div>
        <div className="mb-3">
          <label>Designation</label>
          <input required value={form.designation} onChange={set('designation')} />
        </div>
        <div className="mb-3">
          <label>Email (optional)</label>
          <input type="email" value={form.email} onChange={set('email')} />
        </div>
        <div className="mb-3">
          <label>Company (optional)</label>
          <input value={form.company} onChange={set('company')} />
        </div>
        {isEdit && (
          <div className="mb-3">
            <label className="check">
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Active
            </label>
          </div>
        )}
        <div className="mb-3">
          {currentPhoto && (
            <div className="mb-2">
              <img className="thumb-lg" src={currentPhoto} alt="Current" />
              <div className="muted small">Current photo</div>
            </div>
          )}
          <label>Photograph {isEdit ? '(replace, optional)' : ''}</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0] || null)} />
          <div className="muted small">JPG, PNG or WebP, max 5 MB.</div>
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        <button type="button" className="btn" onClick={() => navigate('/employees')}>Cancel</button>
      </form>
    </div>
  );
}
