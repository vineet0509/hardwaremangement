import React from 'react';
import { FileText, ShieldAlert, Key, Globe, Scale, BookOpen } from 'lucide-react';

const Terms = () => {
  return (
    <div className="card" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), #059669)', width: 80, height: 80, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <FileText size={40} />
          </div>
          <h1 className="responsive-h1" style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: 12 }}>Terms & Conditions</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Last updated: May 2026</p>
        </div>

        <div style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '1.05rem' }}>
          
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Globe color="var(--primary)" /> 1. Agreement to Terms
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              By registering an account and using the Hardware Shop Manager SaaS platform, you agree to be bound by these Terms & Conditions. If you do not agree with all of these terms, you are prohibited from using the application and must discontinue use immediately.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Key color="var(--primary)" /> 2. User Accounts & Security
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
              To access and manage your store database, you must register a tenant account. You agree to:
            </p>
            <ul style={{ color: 'var(--text-muted)', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Provide accurate, current, and complete store and owner registration details.</li>
              <li>Maintain the security and confidentiality of your credentials (emails, passwords).</li>
              <li>Be fully responsible for all transactions, bills, and inventory modifications recorded under your store profile.</li>
              <li>Notify the system administrators immediately of any unauthorized use or security breaches.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <BookOpen color="var(--primary)" /> 3. SaaS Subscription & Trial Period
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Upon successful registration, each store owner is granted a 30-day Trial Period to evaluate the Point of Sale (POS) and inventory system. After the expiration of this trial period, a subscription renewal request must be submitted via settings to maintain writing permissions. Action restricted mode will be activated upon expiration, allowing only viewing of existing ledgers and data.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <ShieldAlert color="var(--primary)" /> 4. Data Usage & Ownership
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              You retain all ownership rights to the inventory, sales transactions, bills, staff logs, and customer ledger data entered into your tenant database partition. Hardware Shop Manager does not share or sell your business details to third parties. We utilize state-of-the-art multi-tenant logical partitioning to guarantee absolute privacy.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Scale color="var(--primary)" /> 5. Limitation of Liability
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Hardware Shop Manager SaaS is provided on an "as-is" and "as-available" basis. In no event shall we or our developers be liable for any direct, indirect, incidental, or consequential damages (including loss of sales data, stock logs, or ledger discrepancies) arising out of your use or inability to use the software.
            </p>
          </section>

          <section>
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              If you have any questions about these Terms & Conditions, please contact our support desk at support@vynkra.in.
            </p>
          </section>
        </div>
    </div>
  );
};

export default Terms;
