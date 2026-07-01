import React from 'react'
import { motion } from 'framer-motion'
import { Scale, Clock, Mail, Globe, Phone, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TermsAndConditions() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By creating an account or using ManageMyPG, you agree to these Terms & Conditions. If you do not agree, do not use the application.'
    },
    {
      title: '2. Eligibility',
      content: 'Users must be at least 18 years old and legally authorized to manage a property, hostel, PG, apartment or rental accommodation.'
    },
    {
      title: '3. User Account',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information and promptly update any changes.'
    },
    {
      title: '4. Services',
      content: 'ManageMyPG provides digital tools for managing properties, rooms, beds, tenants, rent, payments, bookings, complaints, reports and related operational activities.'
    },
    {
      title: '5. User Responsibilities',
      content: (
        <div className="space-y-2">
          <p>You agree to:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Provide accurate information.</li>
            <li>Obtain necessary consent before storing tenant information or identity documents.</li>
            <li>Keep login credentials secure.</li>
            <li>Use the application only for lawful purposes.</li>
            <li>Not upload malicious or illegal content.</li>
          </ul>
        </div>
      )
    },
    {
      title: '6. Prohibited Activities',
      content: (
        <div className="space-y-2">
          <p>You must not:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Attempt unauthorized access.</li>
            <li>Reverse engineer the application.</li>
            <li>Distribute malware.</li>
            <li>Impersonate another person.</li>
            <li>Use the platform for illegal activities.</li>
            <li>Interfere with the security or operation of the service.</li>
          </ul>
        </div>
      )
    },
    {
      title: '7. User Data',
      content: 'You retain ownership of the information you upload. You grant ManageMyPG permission to store, process and display that information solely to provide the requested services.'
    },
    {
      title: '8. Intellectual Property',
      content: 'All software, source code, logos, trademarks, graphics, designs and application content belonging to ManageMyPG remain the exclusive property of ManageMyPG unless otherwise stated.'
    },
    {
      title: '9. Service Availability',
      content: 'We aim to provide reliable service but do not guarantee uninterrupted availability. Maintenance, upgrades or unforeseen technical issues may temporarily affect access.'
    },
    {
      title: '10. Data Security',
      content: 'We implement reasonable administrative, technical and organizational measures to protect user data. Users are also responsible for protecting their own login credentials.'
    },
    {
      title: '11. Suspension or Termination',
      content: 'We may suspend or terminate accounts involved in fraud, abuse, illegal activities, repeated violations of these Terms or actions that threaten platform security.'
    },
    {
      title: '12. Account Deletion',
      content: 'Users may request account deletion. Certain records may be retained where required by law or for legitimate business purposes such as dispute resolution or legal compliance.'
    },
    {
      title: '13. Disclaimer',
      content: "ManageMyPG is provided on an 'AS IS' and 'AS AVAILABLE' basis. While we strive to provide accurate and reliable services, we do not guarantee that the application will always be uninterrupted, error-free or suitable for every business requirement. Users are responsible for verifying information before making business decisions."
    },
    {
      title: '14. Limitation of Liability',
      content: 'To the maximum extent permitted by law, ManageMyPG shall not be liable for indirect, incidental, consequential or business losses arising from the use or inability to use the application.'
    },
    {
      title: '15. Governing Law',
      content: 'These Terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of the competent courts where the company is registered.'
    },
    {
      title: '16. Changes to Terms',
      content: 'We may revise these Terms from time to time. Continued use of the application after updates constitutes acceptance of the revised Terms.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
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
              <Scale size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-indigo-400 mb-4">
                <FileText size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Legal Agreement</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Terms & Conditions</h1>
              <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  Last Updated: June 28, 2026
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
                17. Contact
              </h2>
              <p className="text-slate-600 text-sm md:text-base font-medium pl-4">
                ManageMyPG
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
                <ContactCard icon={Globe} label="Website" value="managemypg.com" href="https://managemypg.com" />
                <ContactCard icon={Mail} label="Email Support" value="support@managemypg.com" href="mailto:support@managemypg.com" />
                <ContactCard icon={Phone} label="Contact" value="Official Support" />
              </div>
            </section>

            <div className="pt-12 text-center border-t border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-loose">
                By continuing to use ManageMyPG, you acknowledge that you have read and understood these Terms & Conditions.
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
