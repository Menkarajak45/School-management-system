import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Users, BookOpen, ClipboardList, LogOut, School } from 'lucide-react';

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/students',   icon: GraduationCap,   label: 'Students'   },
  { to: '/teachers',   icon: Users,           label: 'Teachers'   },
  { to: '/classes',    icon: BookOpen,        label: 'Classes'    },
  { to: '/attendance', icon: ClipboardList,   label: 'Attendance' },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const name = localStorage.getItem('adminName') || 'Admin';

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2><School size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />EduManage</h2>
          <p>School Management System</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon"><item.icon size={18} /></span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar">{name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="admin-name">{name}</div>
              <div className="admin-role">Administrator</div>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}><LogOut size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Logout</button>
        </div>
      </div>
    </>
  );
}
