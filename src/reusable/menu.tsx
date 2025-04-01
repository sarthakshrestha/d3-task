import React, { useState } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";

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
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
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
          <nav className="flex flex-col items-start p-4 space-y-4">
            <a href="#home" className="text-gray-800 hover:text-blue-500">
              Dashboard
            </a>
            <a href="#about" className="text-gray-800 hover:text-blue-500">
              Live API
            </a>
            <a href="#services" className="text-gray-800 hover:text-blue-500">
              Settings
            </a>
          </nav>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Menu;
