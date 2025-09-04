"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  LayoutDashboard,
  BarChart2,
  Menu,
  X,
  LogOut,
  Landmark,
  UserCog,
  Send,
  SquareActivity,
  FileBox,
} from "lucide-react";
import clsx from "clsx";

const menuSections = [
  {
    title: "ASSESSMENTS",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Question Bank", icon: Landmark, href: "/questions-bank" },
            { name: "Candidates", icon: Users, href: "/candidates" },
      { name: "Test Packages", icon: FileBox, href: "/test-packages" },
      { name: "Test Distribution", icon: Send, href: "/test-distribution" },
      { name: "Results", icon: BarChart2, href: "/results" },
    ],
  },
  {
    title: "OTHERS",
    items: [
      { name: "User Acces", icon: UserCog, href: "/user-management" },
      { name: "Logs", icon: SquareActivity, href: "/logs" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border rounded shadow"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          // MOBILE (fixed + slide)
          "fixed top-0 left-0 h-screen w-[260px] bg-gray-50 px-6 py-8 flex flex-col gap-8 z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",

          // DESKTOP (sticky inside layout flow)
          "md:sticky md:top-0 md:self-start md:translate-x-0 md:z-10 md:flex md:h-screen md:w-[260px]"
        )}
      >
        {/* Close button */}
        <button
          className="md:hidden absolute top-4 right-4"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <Image
          src="../images/logo-dwp.svg"
          alt="Logo DWP"
          width={100}
          height={100}
        />

        {/* Menu */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-medium text-gray-400 mb-2">
              {section.title}
            </p>
            <ul className="flex flex-col gap-1">
              {section.items.map(({ name, icon: Icon, href }) => (
                <li key={name}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium",
                      pathname === href
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon
                      size={18}
                      className={
                        pathname === href ? "text-white" : "text-gray-400"
                      }
                    />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {/* Logout Button - Added based on screenshot */}
        <div className="mt-auto">
          <Link
            href="/logout" // Assuming a logout route
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} className="text-red-600" />
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
