import React, { useState } from 'react';
import { Phone, Mail, MapPin, HelpCircle, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for reaching out! We will get back to you soon.");
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', padding: '40px 20px', overflowY: 'auto' }}>
      <div className="login-card" style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '40px', backdropFilter: 'blur(12px)' }}>
        
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline" 
          style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <HelpCircle size={48} color="var(--primary)" style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: 12 }}>Contact Us</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>We are here to help your hardware business succeed.</p>
        </div>

        <div style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '1.05rem', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, minWidth: 250 }}>
            <h3 style={{ marginBottom: 16 }}>Get In Touch</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Phone size={20} color="var(--primary)" /> <span>+91 98765 43210</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mail size={20} color="var(--primary)" /> <span>support@hardwaresoftware.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MapPin size={20} color="var(--primary)" /> <span>Tech Park, Main Street, Delhi</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1.5, minWidth: 300 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Your Name</label>
                <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Email Address</label>
                <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>How can we help?</label>
                <textarea className="form-control" style={{ height: 100, resize: 'none' }} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-end' }}>
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
