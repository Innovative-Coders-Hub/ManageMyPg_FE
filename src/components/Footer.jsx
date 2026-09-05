import { Link } from "react-router-dom"
import LogoImg from "../assets/managemypg.png"
import { Mail, Phone, ExternalLink, Shield, FileText } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800 relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[110px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-white p-1.5 shadow-xl overflow-hidden flex items-center justify-center border border-white/20 shrink-0">
                <img src={LogoImg} alt="ManageMyPg" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-black text-white text-xl tracking-tight block uppercase leading-none">ManageMyPg</span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-indigo-400 font-black mt-1 block">Enterprise Suite v2.0</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed max-w-md text-slate-400 font-bold">
              The next-generation operating system for PG owners. <br />
              <span className="text-slate-300">Simplify management, scale faster, and stay ahead in the rental ecosystem.</span>
            </p>
          </div>

          {/* Quick Links / Support */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-white font-black text-[9.5px] uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="h-1 w-3 bg-indigo-500 rounded-full" />
              Support Channels
            </h4>
            <ul className="space-y-3">
              <FooterLink
                icon={<Mail size={13} />}
                label="General Support"
                value="support@managemypg.com"
                href="mailto:support@managemypg.com"
              />
              <FooterLink
                icon={<Shield size={13} />}
                label="Administrative"
                value="admin@managemypg.com"
                href="mailto:admin@managemypg.com"
              />
              <FooterLink
                icon={<Phone size={13} />}
                label="Direct Helpline"
                value="+91 94937 77076"
                href="tel:9493777076"
              />
            </ul>
          </div>

          {/* Legal / Compliance */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-white font-black text-[9.5px] uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="h-1 w-3 bg-emerald-500 rounded-full" />
              Legal & Compliance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/terms-and-conditions" className="group p-3.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all block">
                <FileText className="text-indigo-400 mb-1.5" size={18} />
                <p className="text-[9.5px] font-black text-white uppercase tracking-widest group-hover:text-indigo-300 transition-colors">Terms of Service</p>
                <p className="text-[8.5px] text-slate-500 mt-0.5 uppercase font-bold tracking-tighter">Usage guidelines</p>
              </Link>
              <Link to="/privacy-policy" className="group p-3.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all block">
                <Shield className="text-emerald-400 mb-1.5" size={18} />
                <p className="text-[9.5px] font-black text-white uppercase tracking-widest group-hover:text-emerald-300 transition-colors">Privacy Policy</p>
                <p className="text-[8.5px] text-slate-500 mt-0.5 uppercase font-bold tracking-tighter">Data protection</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[9.5px] font-black text-slate-500 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} ManageMyPg. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ icon, label, value, href }) {
  return (
    <li className="group">
      <a href={href} className="flex flex-col gap-0.5 transition-all">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
        <div className="flex items-center gap-2 text-slate-300 group-hover:text-indigo-400 transition-colors">
          <div className="h-5 w-5 rounded-md bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all border border-white/5 shrink-0">
            {icon}
          </div>
          <span className="text-xs font-bold tracking-tight">{value}</span>
        </div>
      </a>
    </li>
  )
}
