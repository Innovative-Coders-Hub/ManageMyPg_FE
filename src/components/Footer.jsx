import { Link } from "react-router-dom"
import LogoImg from "../assets/managemypg.png"
import { Mail, Phone, ExternalLink, Shield, FileText } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-white/5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white p-2 shadow-2xl overflow-hidden flex items-center justify-center ring-4 ring-white/10">
                <img src={LogoImg} alt="ManageMyPg" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-black text-white text-2xl tracking-tighter block uppercase leading-none">ManageMyPg</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-black mt-1 block">Enterprise Suite v2.0</span>
              </div>
            </div>

            <p className="text-sm leading-relaxed max-w-md text-slate-400 font-medium">
              The next-generation operating system for PG owners. <br />
              <span className="text-slate-300">Simplify management, scale faster, and stay ahead in the rental ecosystem.</span>
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                <ExternalLink size={18} />
              </a>
              <div className="h-px w-8 bg-white/10" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Connecting owners nationwide</p>
            </div>
          </div>

          {/* Quick Links / Support */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="h-1 w-3 bg-indigo-500 rounded-full" />
              Support Channels
            </h4>
            <ul className="space-y-4">
              <FooterLink
                icon={<Mail size={14} />}
                label="General Support"
                value="support@managemypg.com"
                href="mailto:support@managemypg.com"
              />
              <FooterLink
                icon={<Shield size={14} />}
                label="Administrative"
                value="admin@managemypg.com"
                href="mailto:admin@managemypg.com"
              />
              <FooterLink
                icon={<Phone size={14} />}
                label="Direct Helpline"
                value="+91 94937 77076"
                href="tel:9493777076"
              />
            </ul>
          </div>

          {/* Legal / Compliance */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="h-1 w-3 bg-emerald-500 rounded-full" />
              Legal & Compliance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/terms-and-conditions" className="group p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all block">
                <FileText className="text-indigo-400 mb-2" size={20} />
                <p className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Terms of Service</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Usage guidelines</p>
              </Link>
              <Link to="/privacy-policy" className="group p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all block">
                <Shield className="text-emerald-400 mb-2" size={20} />
                <p className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Privacy Policy</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Data protection</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} ManageMyPg. Powered by Enterprise Infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex gap-4 italic text-slate-600 lowercase font-medium text-[11px] items-center">
              <span>made with</span>
              <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">❤️</div>
              <span>in india</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ icon, label, value, href }) {
  return (
    <li className="group">
      <a href={href} className="flex flex-col gap-1 transition-all">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
        <div className="flex items-center gap-2 text-slate-300 group-hover:text-indigo-400 transition-colors">
          <div className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all border border-white/5">
            {icon}
          </div>
          <span className="text-xs font-bold tracking-tight">{value}</span>
        </div>
      </a>
    </li>
  )
}
