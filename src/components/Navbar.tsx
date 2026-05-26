import { AlignJustify, House, ArrowDownToLine } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full bg-white p-4 rounded flex flex-row border-b border-gray-300">
      <ul className="flex flex-row w-full mr-5 items-center">
        <li className="flex flex-row gap-2">
          <div className="rounded-full w-7 h-7 bg-gray-400 text-white text-xs flex items-center justify-center font-bold">
            {localStorage.getItem("username")?.charAt(0)}
          </div>

          <p className="mt-0.5">
            {localStorage.getItem("username")}
          </p>
        </li>

        <li className="ml-auto flex flex-row">
          <a
            href="/create-listing"
            className="flex bg-green-600 rounded border pb-1 pt-1.5 pl-3 items-center gap-2 pr-6 mr-6 border-r border-gray-300 text-gray-800 hover:text-gray-600"
          >
            <ArrowDownToLine size={20} className="text-white mb-1" />
            <span className="font-medium text-white">Create Listing</span>
          </a>

          <a
            href="/"
            className="flex items-center gap-2 pr-6 mr-6 border-r border-gray-300 text-gray-800 hover:text-gray-600"
          >
            <House size={20} className="mb-1" />
            <span>Home</span>
          </a>

          <a
            href="/settings"
            className="flex items-center gap-2 text-gray-800 hover:text-gray-600"
          >
            <AlignJustify size={20} className="mb-1" />
            <span>Settings</span>
          </a>

        </li>
      </ul>
    </nav>
  );
}