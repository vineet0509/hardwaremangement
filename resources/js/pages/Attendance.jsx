import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, MapPin, Clock } from 'lucide-react';

const Attendance = ({ user }) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/all')
      .then(res => setAttendances(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Calendar color="var(--primary)"/> Attendance History
        </h2>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : attendances.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No attendance records found.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                {user?.role !== 'staff' && <th>Staff Member</th>}
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(record => (
                <tr key={record.id}>
                  {user?.role !== 'staff' && (
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{record.staff?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{record.staff?.role}</div>
                    </td>
                  )}
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    {record.clock_in_time ? new Date(record.clock_in_time).toLocaleTimeString() : '-'}
                    {record.clock_in_location && (
                      <div style={{ fontSize: '0.75rem', marginTop: 4 }}>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${record.clock_in_location}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} /> Map
                        </a>
                      </div>
                    )}
                  </td>
                  <td>
                    {record.clock_out_time ? new Date(record.clock_out_time).toLocaleTimeString() : '-'}
                    {record.clock_out_location && (
                      <div style={{ fontSize: '0.75rem', marginTop: 4 }}>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${record.clock_out_location}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} /> Map
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Attendance;
