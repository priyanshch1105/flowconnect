import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, KeyRound, Mail, ShieldCheck, Zap } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import '../styles/AuthPages.css'

export default function ForgotPasswordPage() {
    return (
        <div className="auth-page grid-pattern">
            <Navbar />
            <div className="auth-page__bg">
                <div className="auth-page__orb auth-page__orb--1" />
                <div className="auth-page__orb auth-page__orb--2" />
                <div className="auth-page__orb auth-page__orb--3" />
            </div>

            <motion.div
                className="auth-card auth-card--wide"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <Link to="/" className="auth-card__logo">
                    <div className="auth-card__logo-icon">
                        <Zap size={20} />
                    </div>
                    <span className="auth-card__logo-text">
                        <span className="gradient-text">Pravah</span>
                    </span>
                </Link>

                <div className="auth-legal__eyebrow">
                    <KeyRound size={14} />
                    Account Recovery
                </div>

                <h1 className="auth-card__title auth-legal__title">Reset Password Help</h1>
                <p className="auth-card__subtitle auth-legal__subtitle">
                    Self-service password reset is not wired up yet. For now, contact the project
                    maintainer or support channel to recover access safely.
                </p>

                <div className="auth-legal__panel">
                    <div className="auth-legal__item">
                        <Mail size={18} />
                        <span>Share the email address tied to your account when requesting help.</span>
                    </div>
                    <div className="auth-legal__item">
                        <ShieldCheck size={18} />
                        <span>Do not send your current password or any secret tokens.</span>
                    </div>
                </div>

                <div className="auth-legal__actions">
                    <Link to="/login" className="btn-primary auth-legal__action">
                        Back to Login
                    </Link>
                    <Link to="/signup" className="auth-legal__secondary">
                        Create a new account instead
                    </Link>
                </div>

                <div className="auth-card__footer">
                    <Link to="/login" className="auth-card__footer-link">
                        <span className="auth-legal__back">
                            <ArrowLeft size={14} />
                            Return to sign in
                        </span>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
