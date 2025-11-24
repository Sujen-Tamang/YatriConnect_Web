import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0d140a] text-white border-t border-[#2e3928]">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-6">
              <div className="size-8 bg-[#59f20d] rounded flex items-center justify-center text-[#0d140a] font-bold mr-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13401 2 5 5.13401 5 9C5 13.5 12 22 12 22C12 22 19 13.5 19 9C19 5.13401 15.866 2 12 2Z"></path>
                  <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z"></path>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">Yatriconnect</span>
            </div>
            <p className="text-[#a6ba9c] mb-6 text-sm leading-relaxed pr-4">
              Revolutionizing how the world moves, one mile at a time. Professional mobility for a modern era.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="size-8 rounded-full bg-[#1c2619] border border-[#2e3928] flex items-center justify-center text-[#a6ba9c] hover:text-[#59f20d] hover:border-[#59f20d]/50 transition-all">
                <span className="sr-only">Facebook</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="size-8 rounded-full bg-[#1c2619] border border-[#2e3928] flex items-center justify-center text-[#a6ba9c] hover:text-[#59f20d] hover:border-[#59f20d]/50 transition-all">
                <span className="sr-only">Twitter</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-bold text-white mb-6">Company</h3>
            <ul className="space-y-4 text-sm text-[#a6ba9c]">
              <li><Link to="/about" className="hover:text-[#59f20d] transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-[#59f20d] transition-colors">Careers</Link></li>
              <li><Link to="/press" className="hover:text-[#59f20d] transition-colors">Press Kit</Link></li>
              <li><Link to="/contact" className="hover:text-[#59f20d] transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-bold text-white mb-6">Services</h3>
            <ul className="space-y-4 text-sm text-[#a6ba9c]">
              <li><Link to="/bus-booking" className="hover:text-[#59f20d] transition-colors">Intercity Travel</Link></li>
              <li><Link to="/bus-booking" className="hover:text-[#59f20d] transition-colors">Daily Commute</Link></li>
              <li><Link to="/bus-booking" className="hover:text-[#59f20d] transition-colors">Business Fleet</Link></li>
              <li><Link to="/bus-booking" className="hover:text-[#59f20d] transition-colors">Cargo Express</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-bold text-white mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-[#a6ba9c]">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#59f20d] text-lg">mail</span>
                <span>hello@yatriconnect.com</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#59f20d] text-lg">call</span>
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#59f20d] text-lg">location_on</span>
                <span>123 Transit Ave, Metro City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#2e3928] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#a6ba9c] text-xs">
            &copy; {currentYear} Yatriconnect Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-[#a6ba9c]">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/cookie" className="hover:text-white transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer