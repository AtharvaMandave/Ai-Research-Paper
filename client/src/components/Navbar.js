"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    FileText,
    Wand2,
    Edit3,
    Menu,
    X,
    LogOut,
    User,
    ChevronDown,
    Settings,
    BookOpen,
    Sparkles,
    LayoutDashboard,
    Shield,
    Bot
} from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClick = () => setUserMenuOpen(false);
        if (userMenuOpen) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [userMenuOpen]);

    const navLinks = [
        { href: '/generate', label: 'Generate', icon: Wand2, description: 'AI Paper Generation' },
        { href: '/editor', label: 'Editor', icon: Edit3, description: 'Research Editor' },
        { href: '/plagiarism', label: 'Plagiarism', icon: Shield, description: 'Check for plagiarism' },
        { href: '/ai-detection', label: 'AI Detector', icon: Bot, description: 'Detect AI content' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled
                ? 'bg-[hsl(var(--background))/80] backdrop-blur-md border-b border-[hsl(var(--border))]'
                : 'bg-transparent'
                }`}
        >
            <div className="container-width h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))]">
                        <FileText className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span className="text-lg font-bold tracking-tight">ARPS</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-[hsl(var(--primary))] ${isActive
                                    ? 'text-[hsl(var(--foreground))]'
                                    : 'text-[hsl(var(--muted-foreground))]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* User Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors"
                            >
                                <div className="w-7 h-7 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center text-xs font-bold">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium">{user.name}</span>
                                <ChevronDown className={`w-3 h-3 text-[hsl(var(--muted-foreground))] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 p-1 rounded-lg bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-md animate-in z-50">
                                    <div className="px-3 py-2 mb-1 border-b border-[hsl(var(--border))]">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
                                    </div>
                                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[hsl(var(--accent))] text-sm transition-colors">
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                    <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[hsl(var(--accent))] text-sm transition-colors">
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 text-sm transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                                Log in
                            </Link>
                            <Link href="/register" className="btn-primary rounded-full px-5 h-9 text-sm">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] p-4 animate-in shadow-lg">
                    <div className="space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <link.icon className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        ))}

                        <div className="h-px bg-[hsl(var(--border))] my-3"></div>

                        {user ? (
                            <>
                                <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors">
                                    <User className="w-5 h-5" />
                                    <span className="font-medium">Dashboard</span>
                                </Link>
                                <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Link href="/login" className="btn-secondary rounded-lg h-10">Log in</Link>
                                <Link href="/register" className="btn-primary rounded-lg h-10">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
