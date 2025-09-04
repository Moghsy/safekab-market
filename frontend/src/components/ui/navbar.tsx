import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import SafekabLogo from "@/assets/safekab-logo.png";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Menu, ShoppingCart, X, ListOrdered } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const NavbarItem = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full p-3 rounded-lg text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 group"
  >
    <div className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
      {icon}
    </div>
    <span className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
      {label}
    </span>
  </button>
);
export const Navbar = ({ className }: { className?: string } = {}) => {
  const { cartItemCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useApi();
  const { user, getIsAdmin } = useAuth();

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-blue-100 dark:border-blue-800 shadow-sm",
          className
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Hamburger Menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(true)}
                className=" hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Menu className="!h-6 !w-6" />
              </Button>

              {/* Logo */}
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => navigate("/")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate("/");
                }}
                aria-label="Go to Home"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={SafekabLogo} alt="Logo" className="w-8 h-8" />
                </div>
                <h1 className="text-xl font-bold text-blue-900 dark:text-blue-100 hidden sm:block">
                  SafeKab Store
                </h1>
              </div>
            </div>

            {/* Right side - Cart and Logout */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/cart")}
                className="relative hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <ShoppingCart className="!h-6 !w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </Button>
              {/* Auth Button: Logout if logged in, Login if not */}
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="ml-2"
                >
                  Logout
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Replace with navigation to login page
                    window.location.href = "/login";
                  }}
                  className="ml-2"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-blue-900 dark:text-blue-100">
                Menu
              </DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(false)}
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="flex-1 p-6">
            <div className="space-y-2">
              <NavbarItem
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
                    />
                  </svg>
                }
                label="Home"
                onClick={() => {
                  navigate("/");
                  setDrawerOpen(false);
                }}
              />
              {/* <NavbarItem
                icon={<User className="h-5 w-5" />}
                label="User Profile"
                onClick={() => setDrawerOpen(false)}
              /> */}
              <NavbarItem
                icon={<ListOrdered className="h-5 w-5" />}
                label="Orders"
                onClick={() => {
                  navigate("/orders");
                  setDrawerOpen(false);
                }}
              />
              {/* <NavbarItem
                icon={<Settings className="h-5 w-5" />}
                label="Settings"
                onClick={() => setDrawerOpen(false)}
              /> */}
              <NavbarItem
                icon={<ShoppingCart className="h-5 w-5" />}
                label={`Cart ${cartItemCount > 0 ? `(${cartItemCount})` : ""}`}
                onClick={() => {
                  navigate("/cart");
                  setDrawerOpen(false);
                }}
              />

              {/* Admin Dashboard - only show for admin users */}
              {user && getIsAdmin() && (
                <NavbarItem
                  icon={
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  }
                  label="Admin Dashboard"
                  onClick={() => {
                    navigate("/admin/dashboard");
                    setDrawerOpen(false);
                  }}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SK</span>
              </div>
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-100">
                  SafeKab Store
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Professional products
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
