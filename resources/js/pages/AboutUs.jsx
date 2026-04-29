import React from 'react';
import { Info, Award, Users, Eye, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

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
          <Info size={48} color="var(--primary)" style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: 12 }}>About Us</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Empowering Hardware Shop Owners Globally</p>
        </div>

        <div style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '1.05rem' }}>
          
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Eye color="var(--primary)" /> Our Vision
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Our goal is to streamline retail workflows for inventory businesses through intuitive user interfaces and strong SaaS isolation. 
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Award color="var(--primary)" /> Why Choose Us?
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
              We offer multi-tenant support securely alongside rich data pipelines.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AboutUs;
