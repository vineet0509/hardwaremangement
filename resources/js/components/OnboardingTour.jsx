import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, Users, FileText, Settings,
  ArrowRight, ArrowLeft, X, CheckCircle, Sparkles,
  BarChart2, Truck, BadgeCheck, Play
} from 'lucide-react';

const STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    iconColor: '#a78bfa',
    iconBg: 'rgba(139, 92, 246, 0.15)',
    badge: '🎉 Welcome!',
    badgeColor: '#a78bfa',
    title: 'Your Store is Live!',
    description: 'Congratulations on setting up your business management system. This quick tour will show you the 5 key areas to get started. It only takes 2 minutes!',
    tips: [
      'Everything you do is auto-saved & secured',
      'Your 30-day trial gives full access to all features',
      'You can switch language to Hindi anytime from the sidebar',
    ],
    cta: null,
  },
  {
    id: 'products',
    icon: Package,
    iconColor: '#34d399',
    iconBg: 'rgba(52, 211, 153, 0.12)',
    badge: 'Step 1 — Products & Stock',
    badgeColor: '#34d399',
    title: 'Add Your Products First',
    description: 'Before you can create bills, you need to add your products and set opening stock. Create categories like "Pipes", "Valves", "Tools" and add each product with its price and quantity.',
    tips: [
      'Set a low-stock alert level for each product',
      'Use CSV Import to bulk-add hundreds of products at once',
      'Stock levels auto-deduct every time you create a bill',
    ],
    cta: { label: 'Go to Products', path: '/products' },
  },
  {
    id: 'suppliers',
    icon: Truck,
    iconColor: '#60a5fa',
    iconBg: 'rgba(96, 165, 250, 0.12)',
    badge: 'Step 2 — Suppliers',
    badgeColor: '#60a5fa',
    title: 'Track Your Suppliers & Payments',
    description: 'Add your retail suppliers and track what you owe them. Record every purchase payment against a supplier to always know your outstanding supplier balances.',
    tips: [
      'Each supplier has a running ledger of all transactions',
      'Great for tracking credit from your raw material distributors',
      'Export supplier reports for tax filing',
    ],
    cta: { label: 'Go to Suppliers', path: '/suppliers' },
  },
  {
    id: 'billing',
    icon: ShoppingCart,
    iconColor: '#f472b6',
    iconBg: 'rgba(244, 114, 182, 0.12)',
    badge: 'Step 3 — Point of Sale',
    badgeColor: '#f472b6',
    title: 'Create Your First Bill',
    description: 'This is where day-to-day sales happen. Search for any product by name, add it to the cart, choose Cash / UPI / Credit payment and print a PDF invoice instantly.',
    tips: [
      'Credit sales auto-create an Udhar (due) record for the customer',
      'UPI, Cash, and mixed payments are all supported',
      'WhatsApp bill sharing is built-in — no extra app needed',
    ],
    cta: { label: 'Create a Bill', path: '/billing' },
  },
  {
    id: 'customers',
    icon: Users,
    iconColor: '#fbbf24',
    iconBg: 'rgba(251, 191, 36, 0.12)',
    badge: 'Step 4 — Customers & Udhar',
    badgeColor: '#fbbf24',
    title: 'Manage Customer Credit (Udhar)',
    description: 'Track all customers who owe you money. Every credit sale is tracked by phone number and name. You can record partial repayments and see running balances at any time.',
    tips: [
      'Search customer by phone to see their full due history',
      'Repayments can be partial — track installments',
      'Dashboard shows top pending dues at a glance',
    ],
    cta: { label: 'View Customers', path: '/customers' },
  },
  {
    id: 'settings',
    icon: Settings,
    iconColor: '#94a3b8',
    iconBg: 'rgba(148, 163, 184, 0.12)',
    badge: 'Step 5 — Settings',
    badgeColor: '#94a3b8',
    title: 'Set Up Your Business Profile',
    description: 'Add your company name, phone number, address and GST number. These details print automatically on every invoice you generate — making it look completely professional.',
    tips: [
      'Your logo and business details appear on every PDF bill',
      'GST number is validated against Indian GSTIN format',
      'Subscription status and renewal is also managed here',
    ],
    cta: { label: 'Open Settings', path: '/settings' },
  },
  {
    id: 'done',
    icon: BadgeCheck,
    iconColor: '#d4af37',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    badge: '✅ All Set!',
    badgeColor: '#d4af37',
    title: "You're Ready to Go!",
    description: "You now know all the key features of your VyaparSync. Start by adding your products, then create your first bill. Your dashboard will fill up with live business data as you go.",
    tips: [
      'Come back to this tour anytime from Help & Support',
      'Contact us at support@vynkra.in for any assistance',
      'Reports section shows daily, monthly & yearly analytics',
    ],
    cta: null,
  },
];

const OnboardingTour = ({ onComplete, user }) => {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();

  const activeSteps = React.useMemo(() => {
    if (!user || user.role !== 'staff') return STEPS;
    
    const perms = user.permissions || {};
    return STEPS.filter(s => {
      if (s.id === 'welcome' || s.id === 'billing' || s.id === 'done') return true;
      if ((s.id === 'products' || s.id === 'suppliers') && perms.can_manage_inventory) return true;
      return false; // customers, settings hidden from staff
    });
  }, [user]);

  const current = activeSteps[step];
  const isLast = step === activeSteps.length - 1;
  const isFirst = step === 0;

  const goTo = (nextStep) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 200);
  };

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      goTo(step + 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    onComplete();
  };

  const handleCtaClick = (path) => {
    handleComplete();
    navigate(path);
  };

  const IconComponent = current.icon;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8, 12, 22, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      {/* Main Card */}
      <div
        style={{
          background: 'linear-gradient(145deg, #0f172a, #1e293b)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '40px',
          maxWidth: 560,
          width: '100%',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          transition: 'opacity 0.2s',
          opacity: animating ? 0 : 1,
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleComplete}
          title="Skip Tour"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#64748b'; }}
        >
          <X size={16} />
        </button>

        {/* Step Progress Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {activeSteps.map((_, i) => (
            <div
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 8,
                background: i === step ? current.iconColor : 'rgba(255,255,255,0.12)',
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: current.iconBg,
            border: `1.5px solid ${current.iconColor}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: `0 8px 24px ${current.iconColor}20`,
          }}>
            <IconComponent size={36} color={current.iconColor} strokeWidth={1.8} />
          </div>
        </div>

        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{
            background: `${current.iconColor}18`,
            color: current.iconColor,
            border: `1px solid ${current.iconColor}35`,
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {current.badge}
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.6rem',
          fontWeight: 800,
          color: '#f1f5f9',
          marginBottom: 12,
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
        }}>
          {current.title}
        </h2>

        {/* Description */}
        <p style={{
          textAlign: 'center',
          color: '#94a3b8',
          lineHeight: 1.7,
          fontSize: '0.95rem',
          marginBottom: 28,
        }}>
          {current.description}
        </p>

        {/* Tips */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {current.tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <CheckCircle size={16} color={current.iconColor} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* CTA to jump to page */}
          {current.cta && (
            <button
              onClick={() => handleCtaClick(current.cta.path)}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 12,
                background: `linear-gradient(135deg, ${current.iconColor}, ${current.iconColor}cc)`,
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: `0 4px 15px ${current.iconColor}40`,
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              <Play size={16} />
              {current.cta.label}
            </button>
          )}

          {/* Navigation Row */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!isFirst && (
              <button
                onClick={() => goTo(step - 1)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: 12,
                background: isLast
                  ? 'linear-gradient(135deg, #d4af37, #b8962d)'
                  : 'linear-gradient(135deg, var(--primary, #4f46e5), #b8962d)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: isLast ? '0 4px 15px rgba(16,185,129,0.3)' : '0 4px 15px rgba(212, 175, 55,0.3)',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              {isLast ? (
                <><BadgeCheck size={18} /> Start Managing My Business</>
              ) : (
                <>Next <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          {/* Skip link */}
          {!isLast && (
            <button
              onClick={handleComplete}
              style={{
                background: 'none',
                border: 'none',
                color: '#475569',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '4px',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseOut={e => e.currentTarget.style.color = '#475569'}
            >
              Skip tour and go to dashboard
            </button>
          )}
        </div>

        {/* Step counter footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: '0.75rem',
          color: '#334155',
        }}>
          {step + 1} of {STEPS.length} — VyaparSync Setup Tour
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
