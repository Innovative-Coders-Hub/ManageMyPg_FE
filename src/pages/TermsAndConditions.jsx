import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scale,
  Clock,
  Mail,
  Globe,
  Phone,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Search,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

export default function TermsAndConditions() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('ALL')

  const sections = [
    {
      id: 'acceptance',
      tag: 'General',
      title: '1. Acceptance of Terms',
      content: 'By creating an account, accessing, or using the ManageMyPG platform and related services, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use or access the application.'
    },
    {
      id: 'eligibility',
      tag: 'Account',
      title: '2. Eligibility & Account Authority',
      content: 'Users must be at least 18 years of age and possess full legal capacity to enter into binding agreements. By registering, you represent that you are legally authorized to manage the specified property, hostel, PG accommodation, apartment, or rental facility.'
    },
    {
      id: 'account-security',
      tag: 'Account',
      title: '3. Account Security & Credentials',
      content: 'You are solely responsible for maintaining the confidentiality of your login credentials (username, password, OTPs). You agree to notify ManageMyPG immediately of any unauthorized account access or security breach. ManageMyPG will not be liable for any loss resulting from unauthorized use of your credentials.'
    },
    {
      id: 'services',
      tag: 'Services',
      title: '4. Scope of Platform Services',
      content: 'ManageMyPG provides cloud-based digital solutions for property administration, bed/room management, resident directory maintenance, rent ledger accounting, automated billing receipts, complaint tracking, and operational analytics.'
    },
    {
      id: 'user-responsibilities',
      tag: 'General',
      title: '5. User Responsibilities & Compliance',
      content: (
        <div className="space-y-3">
          <p>As a registered property owner or manager, you commit to:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-bold text-slate-700 pt-1">
            <li className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>Providing accurate property & pricing data.</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>Obtaining required tenant consent for ID storage.</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>Safeguarding administrative login credentials.</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>Complying with local rental & tenancy laws.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'prohibited',
      tag: 'Security',
      title: '6. Prohibited Activities',
      content: (
        <div className="space-y-3">
          <p>Users are strictly prohibited from:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-bold text-slate-700 pt-1">
            <li className="flex items-center gap-2 p-2.5 bg-rose-50/50 rounded-xl border border-rose-100/80">
              <AlertTriangle size={15} className="text-rose-500 shrink-0" />
              <span>Attempting unauthorized access or data scraping.</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 bg-rose-50/50 rounded-xl border border-rose-100/80">
              <AlertTriangle size={15} className="text-rose-500 shrink-0" />
              <span>Reverse engineering system APIs or codebase.</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 bg-rose-50/50 rounded-xl border border-rose-100/80">
              <AlertTriangle size={15} className="text-rose-500 shrink-0" />
              <span>Distributing malicious code or viruses.</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 bg-rose-50/50 rounded-xl border border-rose-100/80">
              <AlertTriangle size={15} className="text-rose-500 shrink-0" />
              <span>Using the service for fraudulent activities.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'user-data',
      tag: 'Data',
      title: '7. Data Ownership & Usage Consent',
      content: 'You retain full ownership of all tenant records, financial ledgers, and property data uploaded to the system. You grant ManageMyPG a non-exclusive license to host, process, and backup this data solely for enabling platform functionality and rendering services to you.'
    },
    {
      id: 'intellectual-property',
      tag: 'General',
      title: '8. Intellectual Property Rights',
      content: 'All source code, platform architecture, software features, UI designs, graphics, logos, trademarks, and documentation associated with ManageMyPG remain the sole intellectual property of ManageMyPG.'
    },
    {
      id: 'service-availability',
      tag: 'Services',
      title: '9. Platform Uptime & Maintenance',
      content: 'ManageMyPG strives for 99.9% operational availability. However, periodic routine maintenance, infrastructure upgrades, or emergency technical interventions may occasionally cause temporary service disruptions.'
    },
    {
      id: 'data-security',
      tag: 'Security',
      title: '10. Data Security & Encryption',
      content: 'We employ industry-standard SSL/TLS encryption, secure database access protocols, and administrative controls to protect sensitive tenant and property data against unauthorized disclosure or loss.'
    },
    {
      id: 'suspension',
      tag: 'Account',
      title: '11. Account Suspension & Termination',
      content: 'ManageMyPG reserves the right to suspend or terminate account access without prior notice in cases of fraudulent transactions, illegal operations, security compromises, or severe terms non-compliance.'
    },
    {
      id: 'account-deletion',
      tag: 'Account',
      title: '12. Account Deletion & Data Retention',
      content: 'Property owners can request account closure at any time. Upon account termination, personal identifiers are purged, while essential financial records may be retained as required under applicable statutory tax and accounting laws.'
    },
    {
      id: 'disclaimer',
      tag: 'Liability',
      title: '13. Disclaimer of Warranties',
      content: "ManageMyPG is provided on an 'AS IS' and 'AS AVAILABLE' basis without warranties of any kind, whether express or implied. Property owners maintain sole operational responsibility for verifying tenant identity, rent collection, and regulatory compliance."
    },
    {
      id: 'limitation-liability',
      tag: 'Liability',
      title: '14. Limitation of Liability',
      content: 'To the maximum extent permitted under applicable law, ManageMyPG and its affiliates shall not be liable for direct, indirect, incidental, special, or consequential damages resulting from platform use or service downtime.'
    },
    {
      id: 'governing-law',
      tag: 'Liability',
      title: '15. Governing Law & Jurisdiction',
      content: 'These Terms & Conditions are governed by the legal statutes of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts located at the company’s registered headquarters.'
    },
    {
      id: 'terms-amendment',
      tag: 'General',
      title: '16. Amendments to Terms',
      content: 'ManageMyPG reserves the right to modify or update these Terms & Conditions at any time. Continued use of the platform following published amendments constitutes implicit acceptance of the revised Terms.'
    }
  ]

  const filteredSections = useMemo(() => {
    return sections.filter(sec => {
      const matchTag = selectedTag === 'ALL' || sec.tag === selectedTag
      const matchQuery =
        !searchQuery.trim() ||
        sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof sec.content === 'string' && sec.content.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchTag && matchQuery
    })
  }, [sections, selectedTag, searchQuery])

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Terms & Conditions - Legal Agreement"
        description="Review the Terms and Conditions for using ManageMyPg. Understand your rights and responsibilities as a property owner or tenant."
        canonical="/terms-and-conditions"
      />

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* BACK NAVIGATION */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all text-xs font-black uppercase tracking-widest shadow-2xs group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to Application</span>
        </button>

        {/* HERO CARD HEADER */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Scale size={180} />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4">
              <ShieldCheck size={14} />
              <span>Legal Governance & Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-xl mt-2 leading-relaxed">
              Legal framework and operational terms governing property management, resident onboarding, data privacy, and platform services.
            </p>

            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-800/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2 text-indigo-300">
                <Clock size={14} />
                <span>Effective Date: September 2, 2026</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={14} />
                <span>Version 2.4 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search legal clauses or terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* TAG PILLS */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
              {['ALL', 'General', 'Account', 'Services', 'Security', 'Data', 'Liability'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap border ${
                    selectedTag === tag
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTIONS CONTAINER */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-10 space-y-10">
          {filteredSections.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                <FileText size={28} />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">No Matching Terms Found</h4>
              <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto">Try clearing your search term or selecting a different category tab.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedTag('ALL'); }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xs mt-2 cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredSections.map((section) => (
              <section key={section.id} id={section.id} className="space-y-3 pt-2 first:pt-0 border-b border-slate-100/80 pb-8 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="h-5 w-1.5 bg-indigo-600 rounded-full shrink-0" />
                    {section.title}
                  </h2>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-md">
                    {section.tag}
                  </span>
                </div>
                <div className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium pl-4.5">
                  {section.content}
                </div>
              </section>
            ))
          )}

          {/* CONTACT & SUPPORT SECTION */}
          <section className="pt-10 border-t border-slate-100 space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-5 w-1.5 bg-indigo-600 rounded-full shrink-0" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                17. Official Contact & Support
              </h2>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm font-medium pl-4.5">
              For any legal inquiries, data privacy requests, or terms clarification, reach out to our official compliance team:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pl-4.5 pt-1">
              <ContactCard icon={Globe} label="Website Domain" value="managemypg.com" href="https://managemypg.com" />
              <ContactCard icon={Mail} label="Legal Support Email" value="support@managemypg.com" href="mailto:support@managemypg.com" />
              <ContactCard icon={Phone} label="Customer Helpline" value="Official Helpline" />
            </div>
          </section>

          {/* FOOTER ACKNOWLEDGEMENT */}
          <div className="pt-10 text-center border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
              By accessing or managing properties on ManageMyPG, you confirm that you have read, understood, and agreed to these Terms & Conditions.
              <br />
              © {new Date().getFullYear()} ManageMyPG Ecosystem. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

function ContactCard({ icon: Icon, label, value, href }) {
  const content = (
    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:bg-white transition-all group h-full shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-[11px] font-black text-slate-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}
