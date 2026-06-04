import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, MapPin, Clock } from 'lucide-react';

const Attendance = ({ user }) => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [mapLocation, setMapLocation] = useState(null);

  useEffect(() => {
    api.get('/attendance/all')
      .then(res => setAttendances(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Calendar color="var(--primary)"/> Attendance History
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ margin: 0, fontWeight: 600, color: 'var(--text-muted)' }}>From:</label>
            <input 
              type="date" 
              className="form-control" 
              style={{ width: 'auto' }}
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ margin: 0, fontWeight: 600, color: 'var(--text-muted)' }}>To:</label>
            <input 
              type="date" 
              className="form-control" 
              style={{ width: 'auto' }}
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
            />
          </div>
          {(fromDate || toDate) && (
            <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => { setFromDate(''); setToDate(''); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : attendances.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No attendance records found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ minWidth: '600px' }}>
              <thead>
                <tr>
                  {user?.role !== 'staff' && <th>Staff Member</th>}
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                </tr>
              </thead>
              <tbody>
                {attendances
                  .filter(record => {
                    const recordDateStr = record.date.substring(0, 10);
                    if (fromDate && recordDateStr < fromDate) return false;
                    if (toDate && recordDateStr > toDate) return false;
                    return true;
                  })
                  .map(record => (
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
                        <div style={{ fontSize: '0.75rem', marginTop: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setMapLocation(record.clock_in_location)} style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} /> View Map
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {record.clock_out_time ? new Date(record.clock_out_time).toLocaleTimeString() : '-'}
                      {record.clock_out_location && (
                        <div style={{ fontSize: '0.75rem', marginTop: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setMapLocation(record.clock_out_location)} style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} /> View Map
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {attendances.filter(record => {
                    const recordDateStr = record.date.substring(0, 10);
                    if (fromDate && recordDateStr < fromDate) return false;
                    if (toDate && recordDateStr > toDate) return false;
                    return true;
                }).length === 0 && (
                  <tr>
                    <td colSpan={user?.role !== 'staff' ? 4 : 3} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                      No records found for the selected date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mapLocation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Location Map</h3>
              <button className="close-btn" onClick={() => setMapLocation(null)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: 0, height: 400, display: 'flex', flexDirection: 'column' }}>
              <iframe 
                width="100%" 
                style={{ flex: 1, border: 0 }} 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapLocation)}&z=15&output=embed`}
                allowFullScreen>
              </iframe>
              <div style={{ padding: '12px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid var(--border)' }}>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocation)}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
