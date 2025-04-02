
import React, { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Menu as MenuIcon,
  ChevronRight,
  Flame
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Sidebar links
  const sidebarLinks = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      path: "/admin",
      active: location.pathname === "/admin"
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: "Orders",
      path: "/admin/orders",
      active: location.pathname.startsWith("/admin/orders")
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: "Products",
      path: "/admin/products",
      active: location.pathname.startsWith("/admin/products")
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      path: "/admin/users",
      active: location.pathname.startsWith("/admin/users")
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-amber-50 to-white bg-fixed bg-no-repeat">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/lovable-uploads/dff6cd92-5cc1-4fde-8c6f-fb50a0b17822.png')" }}
      />
      
      {/* Mobile Header */}
      <header className="bg-white shadow-sm p-4 md:hidden flex items-center justify-between">
        <Link to="/admin" className="text-xl font-bold text-primary flex items-center">
          <Flame className="h-5 w-5 mr-2" />
          Flames Admin
        </Link>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col h-full">
              <Link to="/admin" className="text-xl font-bold text-primary mb-6 flex items-center">
                <Flame className="h-5 w-5 mr-2" />
                Flames Admin
              </Link>
              
              <nav className="space-y-2 flex-1">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center py-2 px-3 rounded-md transition-colors",
                      link.active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {link.icon}
                    <span className="ml-3">{link.label}</span>
                  </Link>
                ))}
              </nav>
              
              <div className="mt-auto pt-6 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {currentUser?.displayName?.[0] || "A"}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{currentUser?.displayName || "Admin"}</p>
                    <p className="text-sm text-gray-500">{currentUser?.email}</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>
      
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-white shadow-md z-10">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link to="/admin" className="text-xl font-bold text-primary flex items-center">
              <Flame className="h-5 w-5 mr-2" />
              Flames Admin
            </Link>
          </div>
          
          <nav className="flex-1 px-4 pb-4 space-y-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center py-2 px-3 rounded-md transition-colors",
                  link.active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {link.icon}
                <span className="ml-3">{link.label}</span>
                {link.active && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {currentUser?.displayName?.[0] || "A"}
              </div>
              <div className="ml-3">
                <p className="font-medium">{currentUser?.displayName || "Admin"}</p>
                <p className="text-sm text-gray-500 truncate max-w-[120px]">{currentUser?.email}</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 relative z-10">
        <div className="max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
