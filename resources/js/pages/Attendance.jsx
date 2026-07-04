import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, MapPin, Clock } from 'lucide-react';
import Pagination from '../components/Pagination';
import Swal from 'sweetalert2';

const Attendance = ({ user }) => {
  const [attendances, setAttendances] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [mapLocation, setMapLocation] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

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
              onChange={(e) => {
                const newFrom = e.target.value;
                setFromDate(newFrom);
                if (newFrom && toDate) {
                  const from = new Date(newFrom);
                  const to = new Date(toDate);
                  if (to < from || (to - from) / (1000 * 60 * 60 * 24) > 31) {
                    const newTo = new Date(from);
                    newTo.setDate(newTo.getDate() + 31);
                    setToDate(newTo.toISOString().split('T')[0]);
                  }
                }
              }} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ margin: 0, fontWeight: 600, color: 'var(--text-muted)' }}>To:</label>
            <input 
              type="date" 
              className="form-control" 
              style={{ width: 'auto' }}
              value={toDate} 
              min={fromDate}
              max={fromDate ? new Date(new Date(fromDate).getTime() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const newTo = e.target.value;
                if (fromDate) {
                  const from = new Date(fromDate);
                  const to = new Date(newTo);
                  if (to < from) return setToDate(fromDate);
                  if ((to - from) / (1000 * 60 * 60 * 24) > 31) {
                    Swal.fire('Notice', 'Maximum date range is 1 month.', 'info');
                    const maxTo = new Date(from);
                    maxTo.setDate(maxTo.getDate() + 31);
                    return setToDate(maxTo.toISOString().split('T')[0]);
                  }
                }
                setToDate(newTo);
              }} 
            />
          </div>
          <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => { setFromDate(today); setToDate(today); }}>
            Reset to Today
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : attendances.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No attendance records found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(() => {
              const filteredAttendances = attendances.filter(record => {
                const recordDateStr = record.date.substring(0, 10);
                if (fromDate && recordDateStr < fromDate) return false;
                if (toDate && recordDateStr > toDate) return false;
                return true;
              });
              
              const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage);
              const currentAttendances = filteredAttendances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

              return (
                <>
                  {currentAttendances.map(record => (
              <div key={record.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface-hover)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  {user?.role !== 'staff' ? (
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{record.staff?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{record.staff?.role}</div>
                    </div>
                  ) : (
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>Attendance Record</div>
                  )}
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(212, 175, 55, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Clock In</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                      <Clock size={14} color="var(--success)" />
                      {record.clock_in_time ? new Date(record.clock_in_time).toLocaleTimeString() : '-'}
                    </div>
                    {record.clock_in_location && (
                      <button className="btn btn-outline btn-sm" onClick={() => setMapLocation(record.clock_in_location)} style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content', marginTop: '4px', fontSize: '0.75rem' }}>
                        <MapPin size={12} /> View Map
                      </button>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Clock Out</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                      <Clock size={14} color="var(--danger)" />
                      {record.clock_out_time ? new Date(record.clock_out_time).toLocaleTimeString() : '-'}
                    </div>
                    {record.clock_out_location && (
                      <button className="btn btn-outline btn-sm" onClick={() => setMapLocation(record.clock_out_location)} style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content', marginTop: '4px', fontSize: '0.75rem' }}>
                        <MapPin size={12} /> View Map
                      </button>
                    )}
                  </div>
                </div>
              </div>
                  ))}
                  
                  {filteredAttendances.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No records found for the selected date.
                    </div>
                  )}
                  
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              );
            })()}
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
                <a href="#" onClick={(e) => { e.preventDefault(); import('../utils/webview').then(m => m.safeOpen(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocation)}`)); }} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
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
