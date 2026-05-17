import React from 'react';
import { Info, Award, Users, Eye, Shield, Target, Heart, Zap, Globe } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="card" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', width: 80, height: 80, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <Info size={40} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 12 }}>About Us</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Empowering hardware businesses with cutting-edge digital management solutions since 2024.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, marginBottom: 50 }}>
        <div className="stat-card" style={{ padding: '30px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--primary)' }}>
            <Target size={24} /> Our Mission
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            To simplify complex inventory and billing workflows for hardware store owners, allowing them to focus on growth rather than paperwork. We aim to bridge the gap between traditional retail and modern digital efficiency.
          </p>
        </div>

        <div className="stat-card" style={{ padding: '30px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'var(--primary)' }}>
            <Eye size={24} /> Our Vision
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            To become the global standard for SME hardware management systems, fostering a world where every local shop has access to enterprise-grade tools.
          </p>
        </div>
      </div>

      <section style={{ marginBottom: 50 }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Our Core Values</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { icon: Heart, title: "Integrity", desc: "We prioritize honest data handling and secure SaaS isolation." },
            { icon: Zap, title: "Efficiency", desc: "Our tools are optimized for speed, even on low-spec hardware." },
            { icon: Users, title: "Community", desc: "Building features based on direct feedback from shop owners." },
            { icon: Globe, title: "Innovation", desc: "Continuously evolving with modern tech like WhatsApp integration." }
          ].map((val, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '20px' }}>
              <val.icon size={32} color="var(--primary)" style={{ marginBottom: 12 }} />
              <h4 style={{ marginBottom: 8 }}>{val.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '40px', background: 'rgba(79, 70, 229, 0.05)', borderRadius: 20, border: '1px dashed var(--primary)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Why Choose Our Platform?</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
          Built by a team of dedicated developers and retail experts, our Hardware Shop Manager is more than just a billing software. It's a complete ecosystem that handles GST compliance, staff advances, supplier relationships, and real-time stock alerts. With a mobile-responsive design and robust multi-tenant architecture, your data is always safe, isolated, and accessible whenever you need it.
        </p>
      </section>

      <div style={{ textAlign: 'center', marginTop: 50, padding: '20px', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Part of the <strong>Vynkra Technologies</strong> ecosystem.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;

