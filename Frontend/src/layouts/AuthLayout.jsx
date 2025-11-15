import { Outlet } from "react-router-dom"

const AuthLayout = () => {
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-[#0d140a] selection:bg-[#59f20d]/30 selection:text-[#59f20d]">
      <div className="relative w-full max-w-md">
        {/* Decorative neon blur behind */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#59f20d]/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#59f20d]/5 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout