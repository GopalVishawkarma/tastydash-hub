
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Menu as MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  // Try to access auth context, but handle case where it might not be available yet
  const auth = useAuth();
  const { currentUser, isAdmin, logout } = auth || { currentUser: null, isAdmin: false, logout: () => {} };
  const cart = useCart();
  const getTotalItems = cart?.getTotalItems || (() => 0);
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-primary">
              TastyDash
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/menu" className="text-gray-700 hover:text-primary transition-colors">
                Menu
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-gray-700 hover:text-primary transition-colors">
                  Admin
                </Link>
              )}
            </nav>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-primary transition-colors" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link to={isAdmin ? "/admin" : "/profile"}>
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5 mr-2" />
                    {currentUser.displayName || "Profile"}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative mr-4">
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-6 py-4">
                  <Link to="/" className="text-xl font-semibold text-primary">
                    TastyDash
                  </Link>
                  
                  <nav className="flex flex-col space-y-4">
                    <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
                      Home
                    </Link>
                    <Link to="/menu" className="text-gray-700 hover:text-primary transition-colors">
                      Menu
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="text-gray-700 hover:text-primary transition-colors">
                        Admin
                      </Link>
                    )}
                  </nav>
                  
                  {currentUser ? (
                    <div className="flex flex-col space-y-4">
                      <Link to={isAdmin ? "/admin" : "/profile"} className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        {currentUser.displayName || "Profile"}
                      </Link>
                      <Button variant="ghost" className="justify-start" onClick={() => logout()}>
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <Link to="/login">
                        <Button variant="ghost" className="w-full justify-start">
                          Login
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button variant="default" className="w-full">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TastyDash</h3>
              <p className="text-gray-300">
                Delicious food delivered to your doorstep.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/menu" className="text-gray-300 hover:text-white transition-colors">
                    Menu
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-300">
                123 Food Street<br />
                Tasty City, India<br />
                contact@tastydash.com
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TastyDash. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
