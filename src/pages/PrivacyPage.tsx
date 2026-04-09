import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, Zap } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import '../styles/AuthPages.css'

export default function PrivacyPage() {
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
                    <Shield size={14} />
                    Privacy Policy
                </div>
                <h1 className="auth-card__title auth-legal__title">Privacy Overview</h1>
                <p className="auth-card__subtitle auth-legal__subtitle">
                    This page explains the data used by the local auth flow and by optional third-party
                    integrations configured by the operator.
                </p>

                <div className="auth-legal__content">
                    <section>
                        <h2>Account data</h2>
                        <p>
                            The local auth server stores basic account records such as name, email,
                            password hash, and creation timestamp.
                        </p>
                    </section>
                    <section>
                        <h2>Integration data</h2>
                        <p>
                            Workflow runs may send customer and operational data to external services
                            that you explicitly connect, such as messaging, CRM, payment, and form tools.
                        </p>
                    </section>
                    <section>
                        <h2>Operator responsibility</h2>
                        <p>
                            If you deploy this project yourself, you are responsible for setting secrets
                            safely and complying with the privacy requirements of your users and vendors.
                        </p>
                    </section>
                </div>

                <div className="auth-card__footer">
                    <span className="auth-card__footer-text">
                        Want the usage rules too?{' '}
                        <Link to="/terms" className="auth-card__footer-link">
                            Read the terms page
                        </Link>
                    </span>
                </div>
            </motion.div>
        </div>
    )
}
