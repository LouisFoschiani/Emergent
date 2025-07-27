import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Eye, 
  BarChart3, 
  Settings, 
  UserCheck, 
  Building2, 
  MapPin, 
  Network, 
  Headphones, 
  User, 
  Computer, 
  ChevronDown, 
  ChevronRight, 
  HelpCircle, 
  FileText 
} from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuItems = [
    {
      title: "MENU",
      items: [
        { icon: Home, label: "Accueil", path: "/" },
        { icon: Calendar, label: "Plannings", path: "/plannings" },
        { icon: Users, label: "Mes amis", path: "/mes-amis" },
        {
          icon: Eye,
          label: "Plans",
          path: "/plans",
          hasSubmenu: true,
          submenu: [
            { label: "Vue d'ensemble", path: "/plans/overview" },
            { label: "Créer un plan", path: "/plans/create" }
          ]
        }
      ]
    },
    {
      title: "ADMINISTRATEUR",
      items: [
        { icon: BarChart3, label: "Statistiques", path: "/statistiques" },
        {
          icon: Settings,
          label: "Gestion",
          path: "/gestion",
          hasSubmenu: true,
          submenu: [
            { label: "Utilisateurs", path: "/gestion/utilisateurs" },
            { label: "Groupes", path: "/gestion/groupes" },
            { label: "Équipements", path: "/gestion/equipements" }
          ]
        },
        { icon: UserCheck, label: "Utilisateurs", path: "/utilisateurs" },
        { icon: Building2, label: "Flex offices", path: "/flex-offices" },
        { icon: MapPin, label: "Sites", path: "/sites" },
        { icon: Network, label: "Configurations réseau", path: "/configurations-reseau" },
        { icon: Headphones, label: "Capteurs", path: "/capteurs" },
        { icon: User, label: "Groupes", path: "/groupes" },
        { icon: Computer, label: "Équipements", path: "/equipements" }
      ]
    }
  ];

  const bottomItems = [
    { icon: HelpCircle, label: "Support", path: "/support" },
    { icon: FileText, label: "Documentation", path: "/documentation" }
  ];

  return (
    <div className={cn(
      "bg-slate-800 text-white h-screen transition-all duration-300 ease-in-out flex flex-col",
      isCollapsed ? "w-16" : "w-72"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-wider">NOMAD</span>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!isCollapsed && (
              <div className="px-6 mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
            )}
            
            <nav className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  {item.hasSubmenu ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(`${sectionIndex}-${itemIndex}`)}
                        className={cn(
                          "w-full flex items-center gap-3 px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors",
                          isCollapsed && "justify-center px-4"
                        )}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {expandedMenus[`${sectionIndex}-${itemIndex}`] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </button>
                      
                      {!isCollapsed && expandedMenus[`${sectionIndex}-${itemIndex}`] && (
                        <div className="bg-slate-900">
                          {item.submenu.map((subItem, subIndex) => (
                            <NavLink
                              key={subIndex}
                              to={subItem.path}
                              className={({ isActive }) => cn(
                                "block px-12 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors",
                                isActive && "text-blue-400 bg-slate-700"
                              )}
                            >
                              {subItem.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors",
                        isActive && "text-blue-400 bg-slate-700 border-r-2 border-blue-400",
                        isCollapsed && "justify-center px-4"
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  )}
                </div>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Items */}
      <div className="border-t border-slate-700 pt-4 pb-4">
        {bottomItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors",
              isActive && "text-blue-400 bg-slate-700",
              isCollapsed && "justify-center px-4"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;