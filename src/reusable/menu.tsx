import { useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import { Home, Activity, Settings, Menu as MenuIcon, X } from "lucide-react";

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {/* Menu Icon from Lucide */}
        <DrawerTrigger asChild>
          <button
            className="flex items-center justify-center w-10 h-10 bg-transparent border-none cursor-pointer text-white rounded-full hover:bg-zinc-800/50 transition-colors"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </DrawerTrigger>

        {/* Drawer Content */}
        <DrawerContent
          className="bg-white w-1/3 sm:w-1/2"
          data-vaul-drawer-direction="right"
        >
          <DrawerClose asChild>
            <button
              className="absolute top-4 right-4 text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </DrawerClose>
          <nav className="flex flex-col items-start p-4 max-sm:p-6 lg:p-8 space-y-4">
            <a
              href="#home"
              className="flex items-center space-x-2 text-gray-800 hover:text-zinc-500 text-base sm:text-lg lg:text-xl"
            >
              <Home className="w-5 h-5 lg:w-6 lg:h-6" />
              <span>Dashboard</span>
            </a>
            <a
              href="#about"
              className="flex items-center space-x-2 text-gray-800 hover:text-zinc-500 text-base sm:text-lg lg:text-xl"
            >
              <Activity className="w-5 h-5 lg:w-6 lg:h-6" />
              <span>Live API</span>
            </a>
            <a
              href="#services"
              className="flex items-center space-x-2 text-gray-800 hover:text-zinc-500 text-base sm:text-lg lg:text-xl"
            >
              <Settings className="w-5 h-5 lg:w-6 lg:h-6" />
              <span>Settings</span>
            </a>
          </nav>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Menu;
