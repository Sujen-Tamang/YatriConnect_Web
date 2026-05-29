"use client"

import { useState } from "react"
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom"
import { useAdminAuth } from "../contexts/AdminAuthContext"

// Icons helper (inline SVGs keyed by name)
const Icon = ({ name, className = "h-5 w-5" }) => {
  const icons = {
    dashboard: <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />,
    users: <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />,
    bookings: <><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></>,
    payments: <><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></>,
    settings: <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />,
    routes: <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />,
    bus: <><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></>,
    drivers: <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />,
    assignment: <><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" /></>,
    city: <><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H12.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1v-5a1 1 0 00-.293-.707l-3-3A1 1 0 0015 6h-3V5a1 1 0 00-1-1H3zm12.3 4l1.6 1.6V10h-2.9V8h1.3z" /></>,
    citybus: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></>,
    signout: <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L10 11.586V8z" clipRule="evenodd" />,
    chevron: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />,
    collapse: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />,
    legal: <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />,
    marketing: <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 11-2 0 1 1 0 012 0zM8 16v-1a4 4 0 018 0v.183l1.874.469a.5.5 0 01.126.904l-4.551 2.276a.5.5 0 01-.448 0l-4.551-2.276a.5.5 0 01.126-.904L8 16z" />,
  };

  const useFill = !["chevron", "menu", "collapse", "citybus"].includes(name);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill={useFill ? "currentColor" : "none"}
      stroke={useFill ? "none" : "currentColor"}
    >
      {icons[name]}
    </svg>
  );
};

// ── Nav configuration ────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Overview",
    color: "text-emerald-300",
    items: [
      { name: "Dashboard",       path: "/admin/dashboard", icon: "dashboard" },
      { name: "User Management", path: "/admin/users",     icon: "users"     },
      { name: "Bookings",        path: "/admin/bookings",  icon: "bookings"  },
      { name: "Payments",        path: "/admin/payments",  icon: "payments"  },
      { name: "Notifications",  path: "/admin/notifications", icon: "marketing" },
      { name: "Settings",        path: "/admin/settings",  icon: "settings"  },
    ],
  },
  {
    label: "Intercity Travel",
    color: "text-teal-300",
    items: [
      { name: "Route Management",  path: "/admin/routes",            icon: "routes"     },
      { name: "Bus Management",    path: "/admin/schedules",         icon: "bus"        },
    ],
  },
  {
    label: "Personnel",
    color: "text-blue-300",
    items: [
      { name: "Driver Management", path: "/admin/drivers",           icon: "drivers"    },
      { name: "Assign Drivers",    path: "/admin/driver-assignment", icon: "assignment" },
    ],
  },
  {
    label: "Local Travel",
    color: "text-lime-300",
    items: [
      { name: "City Bus Routes", path: "/admin/city-routes", icon: "city"    },
    ],
  },
  {
    label: "Policies",
    color: "text-orange-300",
    items: [
      { name: "Terms & Conditions", path: "/admin/terms",        icon: "legal" },
      { name: "Privacy Policy",     path: "/admin/privacy",      icon: "legal" },
      { name: "Cancellation Policy", path: "/admin/cancellation", icon: "legal" },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────────────
const AdminLayout = () => {
  const { currentAdmin, adminSignOut } = useAdminAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openGroups, setOpenGroups]   = useState({ Overview: true, "Intercity Travel": true, Personnel: true, "Local Travel": true, Policies: true });

  const toggleGroup = (label) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleSignOut = () => { adminSignOut(); navigate("/admin/login"); };

  // Find active page name for header
  const activeName = NAV_GROUPS
    .flatMap((g) => g.items)
    .find((item) => item.path === location.pathname)?.name || "Admin Panel";

  return (
    <div className="flex h-screen bg-[#0d140a] overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 flex flex-col
          bg-[#0d140a]
          border-r border-[#2e3928] transition-all duration-300 ease-in-out relative`}
      >
        {/* Logo */}
        <div className={`flex items-center px-4 py-5 border-b border-[#2e3928] ${!sidebarOpen ? "justify-center" : "gap-3"}`}>
          <div className="w-9 h-9 flex-shrink-0 bg-[#59f20d] rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(89,242,13,0.3)]">  
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d140a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 13.5 12 22 12 22C12 22 19 13.5 19 9C19 5.13 15.87 2 12 2Z"/>
              <circle cx="12" cy="9" r="2.5" fill="#0d140a" stroke="none"/>
            </svg>
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-white font-bold text-sm leading-tight font-display">YatriConnect</p>
              <p className="text-[#59f20d] text-xs">Admin Console</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin scrollbar-thumb-[#2e3928]">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              {/* Group header */}
              {sidebarOpen && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-1.5 mb-1"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#a6ba9c]">
                    {group.label}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 text-[#a6ba9c] transition-transform ${openGroups[group.label] ? "" : "-rotate-90"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {/* Group items */}
              {(openGroups[group.label] || !sidebarOpen) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={!sidebarOpen ? item.name : undefined}
                        className={`flex items-center rounded-xl px-3 py-2.5 transition-all duration-150 group
                          ${
                            isActive
                              ? "bg-[#59f20d] text-[#0d140a] font-semibold shadow-[0_0_15px_rgba(89,242,13,0.2)]"
                              : "text-[#a6ba9c] hover:bg-[#1c2619] hover:text-white"
                          }
                          ${!sidebarOpen ? "justify-center" : "gap-3"}`}
                      >
                        <span className="flex-shrink-0">
                          <Icon name={item.icon} className="h-5 w-5" />
                        </span>
                        {sidebarOpen && (
                          <span className="text-sm truncate">{item.name}</span>
                        )}
                        {sidebarOpen && isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0d140a]"></span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Separator */}
              {sidebarOpen && <div className="mt-2 border-t border-[#2e3928]/60" />}
            </div>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="px-2 py-3 border-t border-[#2e3928]">
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors
              ${!sidebarOpen ? "justify-center" : ""}`}
            title={!sidebarOpen ? "Sign Out" : undefined}
          >
            <Icon name="signout" className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#59f20d] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(89,242,13,0.4)] hover:bg-[#4ed40b] transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-[#0d140a] transition-transform ${sidebarOpen ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-[#0d140a] border-b border-[#2e3928] flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <h1 className="text-base font-bold text-white font-display">{activeName}</h1>
              <p className="text-xs text-[#a6ba9c]">YatriConnect Management System</p>
            </div>

            {/* Admin profile chip */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-[#a6ba9c]">
                {currentAdmin?.name}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#59f20d] flex items-center justify-center text-[#0d140a] font-black text-sm shadow-[0_0_10px_rgba(89,242,13,0.3)]">
                {currentAdmin?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#0d140a] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;