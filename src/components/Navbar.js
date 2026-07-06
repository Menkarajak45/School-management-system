import React, { useEffect, useRef, useState } from 'react';
import { Menu, Bell, GraduationCap, Users, ClipboardCheck, X } from 'lucide-react';
import API from '../api';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Navbar({ title, onMenuClick }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const [open, setOpen]   = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [read, setRead]   = useState(false);
  const ref = useRef();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const [s, t, a] = await Promise.all([
          API.get('/students'),
          API.get('/teachers'),
          API.get(`/attendance?date=${new Date().toISOString().split('T')[0]}`),
        ]);
        const items = [
          ...s.data.slice(-3).reverse().map(x => ({
            id: x._id, icon: GraduationCap, color: '#2563EB', bg: '#eff6ff',
            title: 'New student enrolled',
            desc: x.name,
            time: x.createdAt,
          })),
          ...t.data.slice(-3).reverse().map(x => ({
            id: x._id, icon: Users, color: '#16A34A', bg: '#f0fdf4',
            title: 'New teacher added',
            desc: x.name,
            time: x.createdAt,
          })),
          ...(a.data.length ? [{
            id: 'att-today', icon: ClipboardCheck, color: '#F59E0B', bg: '#fffbeb',
            title: 'Attendance marked today',
            desc: `${a.data.filter(r => r.status === 'Present').length} present · ${a.data.filter(r => r.status === 'Absent').length} absent`,
            time: new Date().toISOString(),
          }] : []),
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
        setNotifs(items);
      } catch {}
    };
    fetchNotifs();
  }, []);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = read ? 0 : notifs.length;

  return (
    <div className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="hamburger" onClick={onMenuClick}><Menu size={20} /></button>
        <div>
          <div className="navbar-title">{title}</div>
          <div className="navbar-date">{today}</div>
        </div>
      </div>

      <div ref={ref} style={{ position: 'relative' }}>
        <button className="notif-btn" onClick={() => { setOpen(o => !o); setRead(true); }}>
          <Bell size={20} />
          {unread > 0 && <span className="notif-badge">{unread}</span>}
        </button>

        {open && (
          <div className="notif-dropdown">
            <div className="notif-header">
              <span>Notifications</span>
              <button onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            {notifs.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : notifs.map((n, i) => (
              <div className="notif-item" key={n.id + i}>
                <div className="notif-icon" style={{ background: n.bg, color: n.color }}>
                  <n.icon size={16} />
                </div>
                <div className="notif-body">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-desc">{n.desc}</div>
                  <div className="notif-time">{n.time ? timeAgo(n.time) : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
