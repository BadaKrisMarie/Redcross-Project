import React from 'react';
import { Link } from '@inertiajs/react';

export default function Navbar() {
    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 48px', background: 'white',
            borderBottom: '1px solid #f0f0f0',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            fontFamily: 'Inter, sans-serif'
        }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div style={{
                    width: '34px', height: '34px', background: '#DC2626',
                    borderRadius: '4px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '900'
                }}>+</div>
                <div>
                    <strong style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#111' }}>Rizal Chapter</strong>
                    <span style={{ display: 'block', fontSize: '10px', color: '#888' }}>Muntinlupa City Branch</span>
                </div>
            </Link>

            <ul style={{ display: 'flex', alignItems: 'center', gap: '28px', listStyle: 'none', margin: 0, padding: 0 }}>
                <li><Link href="/" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>Home</Link></li>
                <li><a href="#about" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>About</a></li>
                <li><a href="#contact" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>Contact</a></li>
                <li>
                    <Link href={route('login')} style={{
                        background: '#DC2626', color: 'white', padding: '8px 18px',
                        borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                        textDecoration: 'none'
                    }}>Log In</Link>
                </li>
            </ul>
        </nav>
    );
}