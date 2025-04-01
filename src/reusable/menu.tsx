import React, { useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import { Home, Activity, Settings } from "lucide-react"; // Import icons from lucide-react

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {/* Hamburger Icon */}
        <DrawerTrigger asChild>
          <button
            className="flex flex-col items-center justify-center w-8 h-8 space-y-1.5 bg-transparent border-none cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>
        </DrawerTrigger>

        {/* Drawer Content */}
        <DrawerContent
          className="bg-white w-3/4 sm:w-1/2"
          data-vaul-drawer-direction="left" // Opens the drawer from the left
        >
          <DrawerClose asChild>
            <button
              className="absolute top-4 right-4 text-gray-800"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </DrawerClose>
          <nav className="flex flex-col items-start p-4 max-sm:p-6 lg:p-8 space-y-4">
            <a
              href="#home"
              className="flex items-center space-x-2 text-gray-800 hover:text-zinc-500 text-base sm:text-lg lg:text-xl"
            >
              <Home className="w-5 h-5 lg:w-6 lg:h-6" /> {/* Home Icon */}
              <span>Dashboard</span>
            </a>
            <a
              href="#about"
              className="flex items-center space-x-2 text-gray-800 hover:text-zinc-500 text-base sm:text-lg lg:text-xl"
            >
              <Activity className="w-5 h-5 lg:w-6 lg:h-6" />{" "}
              {/* Activity Icon */}
              <span>Live API</span>
            </a>
            <a
              href="#services"
              className="flex items-center space-x-2 text-gray-800 hover:text-zinc-500 text-base sm:text-lg lg:text-xl"
            >
              <Settings className="w-5 h-5 lg:w-6 lg:h-6" />{" "}
              {/* Settings Icon */}
              <span>Settings</span>
            </a>
          </nav>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Menu;
