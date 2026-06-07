import React, { useState } from 'react';
import { Phone, Mail, MapPin, HelpCircle, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    api.post('/contact', formData)
      .then(res => {
        setStatus({ success: true, message: res.data.message });
        setFormData({ name: '', email: '', message: '' });
      })
      .catch(err => {
        setStatus({ 
          success: false, 
          message: err.response?.data?.message || 'Failed to send message. Please contact support@vynkra.in.' 
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="card" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', width: 80, height: 80, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <HelpCircle size={40} />
          </div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: 12 }}>Contact Us</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>We are here to help your business succeed.</p>
        </div>

        <div style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '1.05rem', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, minWidth: 250 }}>
            <h3 style={{ marginBottom: 24, fontSize: '1.5rem', fontWeight: 700 }}>Get In Touch</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: 12, borderRadius: 12 }}>
                  <Phone size={24} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Call Us</div>
                  <a href="tel:8924074096" style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none' }}>8924074096</a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: 12, borderRadius: 12 }}>
                  <Mail size={24} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Email Us</div>
                  <a href="mailto:vyaparsync@vynkra.in" style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'none' }}>vyaparsync@vynkra.in</a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: 12, borderRadius: 12 }}>
                  <MapPin size={24} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Visit Us</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>Mishrapur, Gudamba, Lucknow, Uttar Pradesh, India, 226026</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1.5, minWidth: 300, background: 'var(--surface)', padding: '30px', borderRadius: 20, border: '1px solid var(--border)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Your Full Name</label>
                <input type="text" className="form-control" placeholder="John Doe" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Email Address</label>
                <input type="email" className="form-control" placeholder="john@example.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>How can we help?</label>
                <textarea className="form-control" placeholder="Type your message here..." style={{ height: 120, resize: 'none' }} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
              </div>

              {status && (
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  fontSize: '0.9rem', 
                  textAlign: 'center', 
                  background: status.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: status.success ? '#10b981' : '#fca5a5',
                  border: `1px solid ${status.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  fontWeight: 600
                }}>
                  {status.message}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
                <Send size={18} /> {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
    </div>
  );
};

export default ContactUs;
