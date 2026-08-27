'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Server, Shield, Code, FileText, BookOpen } from 'lucide-react';

/* ── Data (all hrefs/labels preserved exactly) ────────────── */
const SECTIONS = [
  {
    group: 'Foundations',
    title: 'Architecture & System Design',
    description: 'Learn how the three-layer privacy model enforces compliance without exposing data.',
    icon: Server,
    links: [
      { label: 'System Design Overview', href: '#', api: false },
      { label: 'Package Structure', href: '#', api: false },
      { label: 'Data Flow: Solvency Proof', href: '#', api: false },
    ],
  },
  {
    group: 'Privacy & Security',
    title: 'Privacy Model',
    description: 'Cryptographic guarantees, zero-knowledge proofs, and threat modeling.',
    icon: Shield,
    links: [
      { label: 'What is Proven vs Hidden', href: '#', api: false },
      { label: 'The Three Privacy Layers', href: '#', api: false },
      { label: 'Poseidon Hash Commitments', href: '#', api: false },
    ],
  },
  {
    group: 'Developer',
    title: 'API Reference',
    description: 'Interact with the ZeroProof platform via REST endpoints.',
    icon: Code,
    links: [
      { label: 'POST /api/proof/solvency', href: '#', api: true, method: 'POST' },
      { label: 'POST /api/proof/compliance', href: '#', api: true, method: 'POST' },
      { label: 'GET /api/audit/status', href: '#', api: true, method: 'GET' },
    ],
  },
  {
    group: 'Workflows',
    title: 'Use Cases & Workflows',
    description: 'Step-by-step guides for different compliance scenarios.',
    icon: FileText,
    links: [
      { label: 'Finance Compliance Walkthrough', href: '#', api: false },
      { label: 'How Regulators Audit Proofs', href: '#', api: false },
    ],
  },
];

const ON_THIS_PAGE = [
  { label: 'Architecture', section: 'Foundations' },
  { label: 'Privacy Model', section: 'Privacy & Security' },
  { label: 'API Reference', section: 'Developer' },
  { label: 'Use Cases', section: 'Workflows' },
];

/* ── DocLink ───────────────────────────────────────────────── */
function DocLink({
  label, href, method, delay = 0,
}: {
  label: string; href: string; method?: string | undefined; delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const isApi = !!method;
  const endpoint = isApi ? label.replace(/^(POST|GET|PUT|DELETE)\s+/, '') : null;

  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5625rem 0.625rem',
        borderRadius: '6px',
        textDecoration: 'none',
        background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 0.15s ease',
        gap: '0.75rem',
        cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
        {isApi && method && (
          <span style={{
            fontSize: '0.625rem', fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: method === 'GET' ? 'var(--color-success)' : 'var(--color-primary)',
            background: method === 'GET' ? 'var(--color-success-subtle)' : 'var(--color-primary-subtle)',
            padding: '0.1rem 0.375rem',
            borderRadius: '3px',
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}>
            {method}
          </span>
        )}
        <span style={{
          fontSize: '0.8125rem',
          fontFamily: isApi ? 'var(--font-mono)' : 'var(--font-sans)',
          color: hovered ? 'var(--color-text)' : 'var(--color-text-muted)',
          transition: 'color 0.15s ease',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {isApi ? endpoint : label}
        </span>
      </span>
      <ArrowRight
        size={13}
        color={hovered ? 'var(--color-text-muted)' : 'var(--color-text-faint)'}
        style={{
          flexShrink: 0,
          transform: hovered ? 'translateX(2px)' : 'translateX(0)',
          transition: 'transform 0.15s ease, color 0.15s ease',
        }}
      />
    </motion.a>
  );
}

/* ── DocSection ────────────────────────────────────────────── */
function DocSection({ section, idx }: { section: typeof SECTIONS[0]; idx: number }) {
  const Icon = section.icon;
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Group label */}
      <div style={{
        fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--color-text-faint)',
        marginBottom: '0.75rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ flex: 1, height: 1, background: 'var(--color-border)', display: 'block' }} />
        {section.group}
        <span style={{ flex: 1, height: 1, background: 'var(--color-border)', display: 'block' }} />
      </div>

      {/* Section card — very light container */}
      <div style={{
        borderRadius: '8px',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'var(--color-border)'}`,
        background: hovered ? 'rgba(255,255,255,0.035)' : 'var(--color-surface)',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.25)' : '0 1px 4px rgba(0,0,0,0.1)',
        transition: 'border-color 0.18s ease, background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.25rem 0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <Icon size={15} color="var(--color-text-faint)" strokeWidth={1.75} />
            <h2 style={{
              fontSize: '0.9375rem', fontWeight: 600,
              color: 'var(--color-text)', letterSpacing: '-0.01em',
              margin: 0,
            }}>
              {section.title}
            </h2>
          </div>
          <p style={{
            fontSize: '0.8125rem', color: 'var(--color-text-faint)',
            lineHeight: 1.6, margin: 0,
          }}>
            {section.description}
          </p>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: 'var(--color-border)' }} />

        {/* Links */}
        <div style={{ padding: '0.5rem 0.625rem' }}>
          {section.links.map((link, i) => (
            <DocLink
              key={link.label}
              label={link.label}
              href={link.href}
              method={'method' in link ? link.method : undefined}
              delay={idx * 0.07 + i * 0.04}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function DocsPage() {
  const top2 = SECTIONS.slice(0, 2);
  const bottom2 = SECTIONS.slice(2, 4);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: '3.5rem', alignItems: 'flex-start' }}>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '3rem' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            <BookOpen size={13} color="var(--color-text-faint)" strokeWidth={1.75} />
            <span style={{
              fontSize: '0.6875rem', fontWeight: 500,
              letterSpacing: '0.07em', textTransform: 'uppercase',
              color: 'var(--color-text-faint)',
            }}>
              Documentation
            </span>
          </div>

          <h1 style={{
            fontSize: '1.875rem', fontWeight: 600,
            letterSpacing: '-0.025em', color: 'var(--color-text)',
            lineHeight: 1.15, marginBottom: '0.625rem',
          }}>
            Platform Documentation
          </h1>
          <p style={{
            fontSize: '0.9375rem', color: 'var(--color-text-muted)',
            lineHeight: 1.65, maxWidth: 520,
            fontWeight: 400,
          }}>
            Everything you need to build with ZeroProof and understand its privacy guarantees.
          </p>
        </motion.div>

        {/* ── Two-column grid rows ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {top2.map((s, i) => <DocSection key={s.title} section={s} idx={i} />)}
          </div>
          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {bottom2.map((s, i) => <DocSection key={s.title} section={s} idx={i + 2} />)}
          </div>
        </div>

        {/* ── Support footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          style={{
            marginTop: '3.5rem',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
              Need help integrating?
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-faint)', lineHeight: 1.6 }}>
              Our engineering team can help you set up ZeroProof in your on-premise environment or private cloud.
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.8125rem' }}
          >
            Contact Support
          </button>
        </motion.div>
      </div>

      {/* ── On this page (right nav) ── */}
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{
          width: 160, flexShrink: 0,
          position: 'sticky', top: '1.5rem',
        }}
      >
        <div style={{
          fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--color-text-faint)',
          marginBottom: '0.875rem',
        }}>
          On this page
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {ON_THIS_PAGE.map(({ label, section }) => (
            <a
              key={label}
              href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-faint)',
                textDecoration: 'none',
                padding: '0.3125rem 0',
                borderLeft: '1px solid var(--color-border)',
                paddingLeft: '0.875rem',
                display: 'block',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-text-faint)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-faint)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </motion.aside>

    </div>
  );
}
