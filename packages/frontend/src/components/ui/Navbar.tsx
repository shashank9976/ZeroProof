'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  Shield, LayoutDashboard, FileCheck, Users,
  Book, Settings, Lock, Zap, LogOut, LogIn, Sun, Moon, ChevronDown,
  Building2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const FINANCE_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/proofs', label: 'Proof Manager', icon: FileCheck },
  { href: '/auditor', label: 'Auditor View', icon: Users },
  { href: '/docs', label: 'Documentation', icon: Book },
];

const WORKPLACE_NAV = [
  { href: '/employee', label: 'Employee Vault', icon: Users },
  { href: '/company', label: 'Company Portal', icon: Building2 },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <aside className="sidebar">
      {/* Logo + Theme toggle at top */}
      <div style={{ padding: '0 4px', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{
          width: 28, height: 28,
          background: 'var(--color-text)',
          borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Shield size={15} color="var(--color-base)" strokeWidth={2} />
        </div>
        <span style={{ fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.01em', color: 'var(--color-text)', flex: 1 }}>
          ZeroProof
        </span>
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', padding: '4px',
              borderRadius: '6px', display: 'flex', alignItems: 'center',
              transition: 'color 0.12s ease', flexShrink: 0,
            }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        )}
      </div>

      {/* Network pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.375rem 0.625rem',
        background: 'var(--color-surface-2)',
        borderRadius: '6px',
        marginBottom: '1.75rem',
        cursor: 'pointer',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--color-success)',
          flexShrink: 0,
          boxShadow: '0 0 0 2px var(--color-success-subtle)',
        }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, flex: 1 }}>
          Midnight Testnet
        </span>
        <ChevronDown size={11} color="var(--color-success)" />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {/* Finance section */}
        <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.375rem' }}>
          Finance
        </div>
        {FINANCE_NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.4375rem 0.5rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--color-text)' : 'var(--color-text-faint)',
                background: isActive ? 'var(--color-surface-2)' : 'transparent',
                marginBottom: '1px',
                transition: 'all 0.12s ease',
                position: 'relative',
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
              {label}
              {isActive && (
                <span style={{
                  marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  flexShrink: 0,
                }} />
              )}
            </Link>
          );
        })}

        {/* Workplace section */}
        <div style={{ height: 1, background: 'var(--color-border)', margin: '0.875rem 0 0.625rem' }} />
        <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 0.5rem', marginBottom: '0.375rem' }}>
          Workplace
        </div>
        {WORKPLACE_NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.4375rem 0.5rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--color-text)' : 'var(--color-text-faint)',
                background: isActive ? 'var(--color-surface-2)' : 'transparent',
                marginBottom: '1px',
                transition: 'all 0.12s ease',
                position: 'relative',
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.75} />
              {label}
              {isActive && (
                <span style={{
                  marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  flexShrink: 0,
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
        {/* User */}
        {session ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.375rem 0.5rem',
            marginBottom: '0.5rem',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--color-surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)',
              flexShrink: 0,
            }}>
              {session.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session.user?.name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', textTransform: 'capitalize' }}>
                {(session.user as any)?.role || 'User'}
              </div>
            </div>
            <button onClick={() => signOut()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)', padding: '2px', display: 'flex' }} title="Sign Out">
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button onClick={() => signIn()} style={{
            width: '100%', padding: '0.4375rem 0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            fontSize: '0.8125rem', fontWeight: 500,
            background: 'var(--color-primary)', color: 'white',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            marginBottom: '0.75rem',
          }}>
            <LogIn size={13} /> Sign in
          </button>
        )}

        {/* Bottom actions row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link href="/settings" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 0.5rem', borderRadius: '6px',
            fontSize: '0.8125rem', color: 'var(--color-text-faint)', textDecoration: 'none',
            flex: 1, fontWeight: 400,
            transition: 'color 0.12s ease',
          }}>
            <Settings size={13} strokeWidth={1.75} />
            Settings
          </Link>
        </div>

        {/* ZK Engine + privacy — collapsed single row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 0.5rem',
          marginTop: '0.5rem',
          borderTop: '1px solid var(--color-border)',
        }}>
          <Zap size={11} color="var(--color-text-faint)" />
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
            Groth16 · Mock
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Lock size={10} color="var(--color-success)" />
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>E2E secured</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
