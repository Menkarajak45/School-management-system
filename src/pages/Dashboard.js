import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import Layout from '../components/Layout';
import API from '../api';
import { GraduationCap, Users, BookOpen, Activity, BarChart2, PieChart as PieIcon, UserCircle } from 'lucide-react';

const PIE_COLORS = ['#16A34A', '#DC2626', '#F59E0B'];

export default function Dashboard() {
  const [stats, setStats]               = useState({ students: 0, teachers: 0, classes: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [monthlyData, setMonthlyData]   = useState([]);
  const [pieData, setPieData]           = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, t, c] = await Promise.all([
          API.get('/students'),
          API.get('/teachers'),
          API.get('/classes'),
        ]);
        setStats({ students: s.data.length, teachers: t.data.length, classes: c.data.length });
        setRecentStudents(s.data.slice(0, 5));
        setRecentTeachers(t.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load stats:', err.message);
      }

      try {
        const att = await API.get('/attendance/monthly-stats');
        const monthly = att.data.map(d => ({
          ...d,
          month: new Date(d.month + '-01').toLocaleString('default', { month: 'short' }),
        }));
        setMonthlyData(monthly);
        const totals = att.data.reduce(
          (acc, d) => {
            acc[0].value += d.Present || 0;
            acc[1].value += d.Absent  || 0;
            acc[2].value += d.Late    || 0;
            return acc;
          },
          [{ name: 'Present', value: 0 }, { name: 'Absent', value: 0 }, { name: 'Late', value: 0 }]
        );
        setPieData(totals);
      } catch (err) {
        console.error('Failed to load attendance stats:', err.message);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: GraduationCap, color: 'blue'   },
    { label: 'Total Teachers', value: stats.teachers, icon: Users,          color: 'green'  },
    { label: 'Total Classes',  value: stats.classes,  icon: BookOpen,       color: 'yellow' },
    { label: 'Active Today',   value: stats.students, icon: Activity,       color: 'red'    },
  ];

  return (
    <Layout title="Dashboard">
      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="card">
          <div className="chart-title"><BarChart2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Monthly Attendance Overview</div>
          {monthlyData.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-icon"><BarChart2 size={40} strokeWidth={1.2} /></div>
              <p>No attendance data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Present" fill="#16A34A" radius={[4,4,0,0]} />
                <Bar dataKey="Absent"  fill="#DC2626" radius={[4,4,0,0]} />
                <Bar dataKey="Late"    fill="#F59E0B" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div className="chart-title"><PieIcon size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Attendance Distribution</div>
          {pieData.every(d => d.value === 0) ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="empty-icon"><PieIcon size={40} strokeWidth={1.2} /></div>
              <p>No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Tables */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Recent Students</h3>
            <span className="badge badge-blue">{stats.students} Total</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Roll No</th><th>Class</th></tr></thead>
              <tbody>
                {recentStudents.length === 0
                  ? <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>No students yet</td></tr>
                  : recentStudents.map(s => (
                    <tr key={s._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {s.photo
                          ? <img src={`http://localhost:5000${s.photo}`} alt="" className="student-photo" />
                          : <div className="photo-placeholder"><UserCircle size={28} strokeWidth={1.2} /></div>}
                        {s.name}
                      </td>
                      <td><span className="badge badge-blue">{s.rollNumber}</span></td>
                      <td>{s.class}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Teachers</h3>
            <span className="badge badge-green">{stats.teachers} Total</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>ID</th><th>Subject</th></tr></thead>
              <tbody>
                {recentTeachers.length === 0
                  ? <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px' }}>No teachers yet</td></tr>
                  : recentTeachers.map(t => (
                    <tr key={t._id}>
                      <td>{t.name}</td>
                      <td><span className="badge badge-green">{t.employeeId}</span></td>
                      <td>{t.subject}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
