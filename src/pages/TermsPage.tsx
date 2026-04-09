import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FileText, Zap } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import '../styles/AuthPages.css'

export default function TermsPage() {
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
                    <FileText size={14} />
                    Terms of Service
                </div>
                <h1 className="auth-card__title auth-legal__title">Project Terms</h1>
                <p className="auth-card__subtitle auth-legal__subtitle">
                    These terms describe the current open-source project expectations for using the
                    app, testing integrations, and contributing changes.
                </p>

                <div className="auth-legal__content">
                    <section>
                        <h2>Use responsibly</h2>
                        <p>
                            You are responsible for the workflows, messages, and third-party actions
                            triggered from your account or local deployment.
                        </p>
                    </section>
                    <section>
                        <h2>Third-party integrations</h2>
                        <p>
                            External providers such as payment, messaging, CRM, and forms services
                            have their own rate limits, terms, and billing rules. Verify those before
                            enabling live automations.
                        </p>
                    </section>
                    <section>
                        <h2>Open-source contributions</h2>
                        <p>
                            Contributions are governed by the repository license, contribution guide,
                            code of conduct, and security policy.
                        </p>
                    </section>
                </div>

                <div className="auth-card__footer">
                    <span className="auth-card__footer-text">
                        Need the privacy details too?{' '}
                        <Link to="/privacy" className="auth-card__footer-link">
                            Read the privacy page
                        </Link>
                    </span>
                </div>
            </motion.div>
        </div>
    )
}
