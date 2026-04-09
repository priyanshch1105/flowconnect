import { Zap, Github, Twitter, MessageCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Footer.css'

const footerLinks = {
    Product: [
        { label: 'Features', href: '/#features', type: 'section' },
        { label: 'Integrations', href: '/#integrations', type: 'section' },
        { label: 'Pricing', href: '/pricing', type: 'page' },
        { label: 'How It Works', href: '/how-it-works', type: 'page' },
        { label: 'Get Started', href: '/signup', type: 'page' },
    ],
    Solutions: [
        { label: 'E-commerce', href: '/builder', type: 'page' },
        { label: 'Fintech', href: '/builder', type: 'page' },
        { label: 'Real Estate', href: '/builder', type: 'page' },
        { label: 'Logistics', href: '/builder', type: 'page' },
        { label: 'Marketing', href: '/builder', type: 'page' },
    ],
    Company: [
        { label: 'About', href: '/about', type: 'page' },
        { label: 'Blog', href: '/about#blog', type: 'page' },
        { label: 'Careers', href: '/about#company', type: 'page' },
        { label: 'Press Kit', href: '/about#resources', type: 'page' },
        { label: 'Contact', href: '/about#contact', type: 'page' },
    ],
    Legal: [
        { label: 'Privacy Policy', href: '/privacy', type: 'page' },
        { label: 'Terms of Service', href: '/terms', type: 'page' },
        { label: 'Cookie Policy', href: '/privacy', type: 'page' },
        { label: 'GDPR', href: '/privacy', type: 'page' },
    ],
}

export default function Footer() {
    const location = useLocation()
    const navigate = useNavigate()
    const isHome = location.pathname === '/'

    const handleFooterClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, type: string) => {
        if (type !== 'section') return

        const hash = href.substring(href.indexOf('#'))
        if (!isHome) return

        e.preventDefault()
        const element = document.querySelector(hash)
        if (!element) return

        const navHeight = 80
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        window.scrollTo({
            top: elementPosition - navHeight,
            behavior: 'smooth',
        })
    }

    const handleSocialClick = (target: string) => {
        navigate(target)
    }

    return (
        <footer className="footer" id="footer">
            <div className="container">
                <div className="footer__top">
                    {/* Logo & desc */}
                    <div className="footer__brand">
                        <Link to="/" className="footer__logo">
                            <div className="footer__logo-icon">
                                <Zap size={18} />
                            </div>
                            <span className="footer__logo-text">
                                <span className="gradient-text">Pravah</span>
                            </span>
                        </Link>
                        <p className="footer__brand-desc">
                            Pravah helps you automate business workflows 
                            across WhatsApp, Razorpay, Zoho, and 500+ Indian apps.
                        </p>
                        <div className="footer__socials">
                            <button
                                type="button"
                                className="footer__social"
                                aria-label="GitHub"
                                id="footer-github"
                                onClick={() => handleSocialClick('/about#resources')}
                            >
                                <Github size={18} />
                            </button>
                            <button
                                type="button"
                                className="footer__social"
                                aria-label="Twitter"
                                id="footer-twitter"
                                onClick={() => handleSocialClick('/about#blog')}
                            >
                                <Twitter size={18} />
                            </button>
                            <button
                                type="button"
                                className="footer__social"
                                aria-label="Discord"
                                id="footer-discord"
                                onClick={() => handleSocialClick('/about#contact')}
                            >
                                <MessageCircle size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title} className="footer__col">
                            <h4 className="footer__col-title">{title}</h4>
                            <ul className="footer__col-links">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="footer__link"
                                            onClick={(e) => handleFooterClick(e, link.href, link.type)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>          

                <div className="footer__bottom">
                    <p className="footer__copyright">
                        © 2026 Pravah. All rights reserved. Made in India.
                    </p>
                    <div className="footer__chain-badge">
                        <span className="footer__chain-dot" />
                        Infrastructure optimized for Bharat
                    </div>
                </div>
            </div>
        </footer>
    )
}
