import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Clock, Mail, Globe, Phone, FileText, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Introduction',
      content: 'This Privacy Policy explains how ManageMyPG collects, uses, stores and protects personal information when you use our mobile application and related services. By creating an account or using the application, you agree to this Privacy Policy.'
    },
    {
      title: '2. Information We Collect',
      content: (
        <ul className="list-disc ml-5 space-y-2">
          <li><strong>Account Information:</strong> Name, email address, mobile number, encrypted password and profile photo.</li>
          <li><strong>Pgs Information:</strong> Pg name, address, floors, rooms, beds, rent configuration and occupancy details.</li>
          <li><strong>Tenant Information:</strong> Tenant name, contact details, emergency contact, address, rent details, payment records, complaint records and booking details.</li>
          <li><strong>Documents:</strong> Aadhaar, Passport, Driving Licence or other identity documents uploaded by authorized users.</li>
          <li><strong>Technical Information:</strong> Device model, operating system, app version, IP address, login history and diagnostic logs.</li>
          <li><strong>Push Notification Token:</strong> Firebase Cloud Messaging (FCM) token to deliver important notifications.</li>
        </ul>
      )
    },
    {
      title: '3. How We Use Information',
      content: (
        <ul className="list-disc ml-5 space-y-2">
          <li>Create and manage user accounts.</li>
          <li>Authenticate users securely.</li>
          <li>Manage properties, rooms, beds and tenants.</li>
          <li>Process rent and payment records.</li>
          <li>Store uploaded documents.</li>
          <li>Respond to support requests.</li>
          <li>Improve application performance.</li>
          <li>Detect fraud and unauthorized access.</li>
          <li>Comply with applicable laws.</li>
        </ul>
      )
    },
    {
      title: '4. Information Sharing',
      content: (
        <div className="space-y-2">
          <p>We do not sell your personal information. Information may be shared only:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>With trusted infrastructure providers hosting the application.</li>
            <li>When required by law or a lawful government request.</li>
            <li>To protect the security, rights or safety of users or ManageMyPG.</li>
            <li>With your consent.</li>
          </ul>
        </div>
      )
    },
    {
      title: '5. Data Security',
      content: (
        <div className="space-y-2">
          <p>We implement reasonable security measures including:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>HTTPS (SSL/TLS) encrypted communication.</li>
            <li>Encrypted password storage.</li>
            <li>JWT based authentication.</li>
            <li>Role-based access control.</li>
            <li>Secure server and database access.</li>
            <li>Regular security updates.</li>
          </ul>
          <p className="italic text-slate-500">Although we strive to protect your information, no method of electronic storage or transmission is completely secure.</p>
        </div>
      )
    },
    {
      title: '6. Data Retention',
      content: 'Account information is retained while your account remains active. Tenant and Pgs records are retained until deleted by the owner or account deletion request is completed, unless a longer retention period is required by law.'
    },
    {
      title: '7. User Rights',
      content: (
        <ul className="list-disc ml-5 space-y-1">
          <li>View and update their profile.</li>
          <li>Correct inaccurate information.</li>
          <li>Request account deletion.</li>
          <li>Contact support regarding privacy concerns.</li>
        </ul>
      )
    },
    {
      title: '8. App Permissions',
      content: (
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Camera:</strong> Capture profile photos and identity documents.</li>
          <li><strong>Photos/Storage:</strong> Upload profile images and documents.</li>
          <li><strong>Internet:</strong> Communicate securely with ManageMyPG servers.</li>
          <li><strong>Notifications:</strong> Receive important application notifications.</li>
        </ul>
      )
    },
    {
      title: '9. Third-Party Services',
      content: 'ManageMyPG currently uses Firebase Cloud Messaging for push notifications and secure server infrastructure for hosting application data. Additional services may be added in future updates and this policy will be updated accordingly.'
    },
    {
      title: '10. Children\'s Privacy',
      content: 'ManageMyPG is intended for use by adults managing rental or PG properties. We do not knowingly collect personal information directly from children.'
    },
    {
      title: '11. Account Deletion',
      content: 'Users may request deletion of their account by contacting support or using the account deletion option when available. After verification, personal information will be removed subject to legal and operational retention requirements.'
    },
    {
      title: '12. Changes to this Policy',
      content: 'We may update this Privacy Policy from time to time. Material changes will be reflected by updating the Last Updated date and, where appropriate, notifying users through the application.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Privacy Policy"
        description="Read the ManageMyPg Privacy Policy to understand how we collect, use, and protect your personal and property data."
        canonical="/privacy-policy"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Go Back</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 md:p-12 text-white relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Shield size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-indigo-400 mb-4">
                <FileText size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Legal Document</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
              <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  Last Updated: June 30, 2026
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                  <span className="h-6 w-1 bg-indigo-600 rounded-full" />
                  {section.title}
                </h2>
                <div className="text-slate-600 text-sm md:text-base leading-relaxed font-medium pl-4">
                  {section.content}
                </div>
              </section>
            ))}

            <section className="pt-12 border-t border-slate-100 space-y-6">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                <span className="h-6 w-1 bg-indigo-600 rounded-full" />
                13. Contact Us
              </h2>
              <p className="text-slate-600 text-sm md:text-base font-medium pl-4">
                If you have questions regarding this Privacy Policy, contact:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                <ContactCard icon={Globe} label="Website" value="managemypg.com" href="https://managemypg.com" />
                <ContactCard icon={Mail} label="Email Support" value="support@managemypg.com" href="mailto:support@managemypg.com" />
                <ContactCard icon={Phone} label="Contact" value="Official Support" />
              </div>
            </section>

            <div className="pt-12 text-center border-t border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-loose">
                By continuing to use ManageMyPG, you acknowledge that you have read and understood this Privacy Policy.
                <br />
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
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors group h-full">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-[11px] font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}
