import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Clock, Mail, Globe, Phone, FileText, ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState(0)

  const sections = [
    {
      id: 'sec-1',
      title: '1. Introduction',
      content: 'This Privacy Policy explains how ManageMyPG collects, uses, stores and protects personal information when you use our mobile application and related services. By creating an account or using the application, you agree to this Privacy Policy.'
    },
    {
      id: 'sec-2',
      title: '2. Information We Collect',
      content: (
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <span><strong>Account Information:</strong> Name, email address, mobile number, encrypted password and profile photo.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <span><strong>PG Information:</strong> PG name, address, floors, rooms, beds, rent configuration and occupancy details.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <span><strong>Tenant Information:</strong> Tenant name, contact details, emergency contact, address, rent details, payment records, complaint records and booking details.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <span><strong>Documents:</strong> Aadhaar, Passport, Driving Licence or other identity documents uploaded by authorized users.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <span><strong>Technical Information:</strong> Device model, operating system, app version, IP address, login history and diagnostic logs.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <span><strong>Push Notification Token:</strong> Firebase Cloud Messaging (FCM) token to deliver important notifications.</span>
          </li>
        </ul>
      )
    },
    {
      id: 'sec-3',
      title: '3. How We Use Information',
      content: (
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {[
            'Create and manage user accounts.',
            'Authenticate users securely.',
            'Manage properties, rooms, beds and tenants.',
            'Process rent and payment records.',
            'Store uploaded documents.',
            'Respond to support requests.',
            'Improve application performance.',
            'Detect fraud and unauthorized access.',
            'Comply with applicable laws.'
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm font-bold text-slate-700">
              <div className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    },
    {
      id: 'sec-4',
      title: '4. Information Sharing',
      content: (
        <div className="space-y-3">
          <p>We do not sell your personal information. Information may be shared only:</p>
          <ul className="space-y-2">
            {[
              'With trusted infrastructure providers hosting the application.',
              'When required by law or a lawful government request.',
              'To protect the security, rights or safety of users or ManageMyPG.',
              'With your consent.'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-slate-700 font-bold">
                <ChevronRight size={14} className="text-indigo-600 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: 'sec-5',
      title: '5. Data Security',
      content: (
        <div className="space-y-3">
          <p>We implement reasonable security measures including:</p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {[
              'HTTPS (SSL/TLS) encrypted communication',
              'Encrypted password storage',
              'JWT based authentication',
              'Role-based access control',
              'Secure server and database access',
              'Regular security updates'
            ].map((sec, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs font-bold text-emerald-900">
                <Shield size={14} className="text-emerald-600 shrink-0" />
                <span>{sec}</span>
              </div>
            ))}
          </div>
          <p className="italic text-slate-500 text-xs pt-1">Although we strive to protect your information, no method of electronic storage or transmission is completely secure.</p>
        </div>
      )
    },
    {
      id: 'sec-6',
      title: '6. Data Retention',
      content: 'Account information is retained while your account remains active. Tenant and PG records are retained until deleted by the owner or account deletion request is completed, unless a longer retention period is required by law.'
    },
    {
      id: 'sec-7',
      title: '7. User Rights',
      content: (
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {[
            'View and update profile information',
            'Correct inaccurate data records',
            'Request account deletion',
            'Contact support regarding privacy concerns'
          ].map((right, i) => (
            <li key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800">
              <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
              <span>{right}</span>
            </li>
          ))}
        </ul>
      )
    },
    {
      id: 'sec-8',
      title: '8. App Permissions',
      content: (
        <ul className="space-y-2">
          <li><strong>Camera:</strong> Capture profile photos and identity documents.</li>
          <li><strong>Photos/Storage:</strong> Upload profile images and documents.</li>
          <li><strong>Internet:</strong> Communicate securely with ManageMyPG servers.</li>
          <li><strong>Notifications:</strong> Receive important application notifications.</li>
        </ul>
      )
    },
    {
      id: 'sec-9',
      title: '9. Third-Party Services',
      content: 'ManageMyPG currently uses Firebase Cloud Messaging for push notifications and secure server infrastructure for hosting application data. Additional services may be added in future updates and this policy will be updated accordingly.'
    },
    {
      id: 'sec-10',
      title: '10. Children\'s Privacy',
      content: 'ManageMyPG is intended for use by adults managing rental or PG properties. We do not knowingly collect personal information directly from children.'
    },
    {
      id: 'sec-11',
      title: '11. Account Deletion',
      content: 'Users may request deletion of their account by contacting support or using the account deletion option when available. After verification, personal information will be removed subject to legal and operational retention requirements.'
    },
    {
      id: 'sec-12',
      title: '12. Changes to this Policy',
      content: 'We may update this Privacy Policy from time to time. Material changes will be reflected by updating the Last Updated date and, where appropriate, notifying users through the application.'
    }
  ]

  const scrollToSection = (id, idx) => {
    setActiveSection(idx)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <SEO
        title="Privacy Policy"
        description="Read the ManageMyPg Privacy Policy to understand how we collect, use, and protect your personal and property data."
        canonical="/privacy-policy"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Return to Home</span>
          </button>
        </div>

        {/* Hero Card */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Shield size={160} />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
              <FileText size={13} />
              <span>Legal Document</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">Privacy Policy</h1>
            <p className="text-slate-400 text-xs sm:text-sm font-bold leading-relaxed max-w-2xl">
              Comprehensive guidelines on how ManageMyPG protects your data, handles privacy rights, and secures property records.
            </p>
            <div className="pt-2 flex items-center gap-4 text-slate-400 text-xs font-bold">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Clock size={14} className="text-indigo-400" />
                <span>Last Updated: June 30, 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Quick Table of Contents Sidebar */}
          <div className="hidden lg:block lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs sticky top-8">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <FileText size={16} className="text-indigo-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Document Sections</h3>
            </div>
            <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
              {sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id, idx)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeSection === idx
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{sec.title}</span>
                  <ChevronRight size={14} className="shrink-0 opacity-50" />
                </button>
              ))}
              <button
                onClick={() => scrollToSection('sec-13', 12)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeSection === 12
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>13. Contact Us</span>
                <ChevronRight size={14} className="shrink-0 opacity-50" />
              </button>
            </nav>
          </div>

          {/* Main Sections Column */}
          <div className="lg:col-span-8 space-y-6">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                id={section.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4 scroll-mt-8"
              >
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <span className="h-5 w-1 bg-indigo-600 rounded-full shrink-0" />
                  {section.title}
                </h2>
                <div className="text-slate-600 text-xs sm:text-sm leading-relaxed font-bold pl-4">
                  {section.content}
                </div>
              </div>
            ))}

            {/* Contact Us Section */}
            <div id="sec-13" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5 scroll-mt-8">
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="h-5 w-1 bg-indigo-600 rounded-full shrink-0" />
                13. Contact Us
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-bold pl-4">
                If you have questions regarding this Privacy Policy, contact our dedicated privacy team:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-4 pt-1">
                <ContactCard icon={Globe} label="Website" value="managemypg.com" href="https://managemypg.com" />
                <ContactCard icon={Mail} label="Email Support" value="support@managemypg.com" href="mailto:support@managemypg.com" />
                <ContactCard icon={Phone} label="Direct Helpline" value="+91 94937 77076" href="tel:9493777076" />
              </div>
            </div>

            {/* Acknowledgment Footer */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white text-center space-y-2 border border-slate-800">
              <p className="text-xs font-bold text-slate-300">
                By continuing to use ManageMyPG, you acknowledge that you have read and understood this Privacy Policy.
              </p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                © {new Date().getFullYear()} ManageMyPG Ecosystem. All rights reserved.
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}

function ContactCard({ icon: Icon, label, value, href }) {
  const content = (
    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:bg-white transition-all group h-full shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
          <Icon size={16} />
        </div>
        <div>
          <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-xs font-black text-slate-900 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
        {content}
      </a>
    )
  }

  return content
}
