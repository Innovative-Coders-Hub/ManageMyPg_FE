import { Link } from "react-router-dom"
import LogoImg from "../assets/managemypg.png"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-24 w-24 rounded-full bg-white p-0 shadow-sm overflow-hidden">
              <img src={LogoImg} alt="ManageMyPg" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-white text-xl tracking-tight">ManageMyPg</span>
          </div>
          <p className="text-sm leading-relaxed">
            The next-generation operating system for PG owners. Simplify management, scale faster, and stay ahead.
          </p>
        </div>

        <div>
          <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Platform</h4>
          <ul className="space-y-4 text-sm font-bold">
            <li><Link to="/home" className="hover:text-white transition-colors">Home Dashboard</Link></li>
            <li><Link to="/my-pgs" className="hover:text-white transition-colors">Manage Properties</Link></li>
            <li><Link to="/tenants" className="hover:text-white transition-colors">Tenant Directory</Link></li>
            <li><Link to="/reports" className="hover:text-white transition-colors">Financial Reports</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Support</h4>
          <ul className="space-y-4 text-sm font-bold">
            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Legal</h4>
          <ul className="space-y-4 text-sm font-bold">
            <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Security Overview</a></li>
            <li><a href="#" className="hover:text-white transition-colors">GDPR Compliance</a></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest">
        <p>© {new Date().getFullYear()} ManageMyPg. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white">Twitter</a>
          <a href="#" className="hover:text-white">LinkedIn</a>
          <a href="#" className="hover:text-white">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
