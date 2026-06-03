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
              By registering an account and using the VyaparSync SaaS platform, you agree to be bound by these Terms & Conditions. If you do not agree with all of these terms, you are prohibited from using the application and must discontinue use immediately.
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
              You retain all ownership rights to the inventory, sales transactions, bills, staff logs, and customer ledger data entered into your tenant database partition. VyaparSync does not share or sell your business details to third parties. We utilize state-of-the-art multi-tenant logical partitioning to guarantee absolute privacy.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Scale color="var(--primary)" /> 5. Limitation of Liability
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              VyaparSync SaaS is provided on an "as-is" and "as-available" basis. In no event shall we or our developers be liable for any direct, indirect, incidental, or consequential damages (including loss of sales data, stock logs, or ledger discrepancies) arising out of your use or inability to use the software.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <ShieldAlert color="var(--danger)" /> 6. Strict No Refund Policy
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
              VyaparSync enforces a strict <strong>No Refund Policy</strong>. Please read carefully:
            </p>
            <ul style={{ color: 'var(--text-muted)', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>We provide a full 30-day free trial so you can thoroughly evaluate the software before committing to a paid plan.</li>
              <li>Once a subscription plan (Pro, Business, or Enterprise) is purchased and activated, <strong>no refunds, partial or full, will be issued under any circumstances</strong>.</li>
              <li>This policy applies regardless of your usage of the platform, your business status, or any dissatisfaction after the purchase.</li>
              <li>Subscription downgrades will not result in prorated refunds or credits.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Globe color="var(--primary)" /> 7. Tax & Legal Compliance
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              VyaparSync provides tools to calculate taxes (such as GST) and generate invoices. However, you, as the business owner, are solely responsible for verifying the accuracy of tax calculations, ensuring compliance with your local and national tax authorities, and legally filing your returns. VyaparSync acts only as a software provider and accepts no liability for tax miscalculations or legal disputes arising from your invoices.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <Key color="var(--primary)" /> 8. Fair Usage Policy & API Limits
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              While we offer unmetered bandwidth for standard business operations, all accounts are subject to a Fair Usage Policy. You agree not to abuse the system through automated bots, excessive API requests, or using the platform for non-retail file hosting. VyaparSync reserves the right to throttle or suspend accounts that negatively impact server performance or other tenants.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <ShieldAlert color="var(--primary)" /> 9. Account Termination & Suspension
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              VyaparSync reserves the right to immediately suspend or terminate your account, without prior notice, if you are found to be using the platform for illegal activities, selling prohibited goods, violating these terms, or engaging in fraudulent behavior. Upon termination for breach of terms, no refunds will be provided and access to your data may be permanently revoked.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.5rem', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <BookOpen color="var(--primary)" /> 10. Service Availability & Maintenance
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              We strive to maintain a 99.9% uptime for all our SaaS infrastructure. However, VyaparSync may occasionally require scheduled downtime for upgrades and maintenance. We will make reasonable efforts to notify business owners of scheduled maintenance windows. We are not liable for any lost revenue or operational disruption caused by unscheduled outages or internet service provider failures.
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
