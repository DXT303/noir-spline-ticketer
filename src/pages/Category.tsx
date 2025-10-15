import { useState } from "react";
import { useParams } from "react-router-dom";

import SplineViewer from "@/components/SplineViewer";

const categories = [
  {
    title: "Hardware",
    items: [
      "Computers/Laptops",
      "Printers/Scanners",
      "Monitors/Displays",
      "Keyboards/Mice",
      "Network Equipment (Routers, Switches)",
      "Servers",
      "Mobile Devices",
      "Peripheral Devices",
    ],
  },
  {
    title: "Software",
    items: [
      "Operating Systems",
      "Microsoft Office",
      "Email Clients",
      "Business Applications",
      "Antivirus/Security Software",
      "Database Systems",
      "Custom Software",
      "Web Browsers",
    ],
  },
  {
    title: "Network",
    items: [
      "Internet Connectivity",
      "Wi-Fi Issues",
      "VPN Access",
      "Network Drives",
      "Email Delivery",
      "VoIP/Phone Systems",
    ],
  },
  {
    title: "Access & Security",
    items: [
      "Password Reset",
      "Account Lockout",
      "Access Permissions",
      "Security Breaches",
      "Two-Factor Authentication",
    ],
  },
  {
    title: "Other Problems",
    items: [
      "Email Issues",
      "File Recovery",
      "Data Backup",
      "Training/How-To",
      "New User Setup",
      "Equipment Request",
    ],
  },
];

const highlightText = (text: string, highlight: string) => {
  if (!highlight) {
    return text;
  }
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-300 text-black">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

const Category = () => {
  const { categoryName } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <SplineViewer url="https://prod.spline.design/a0fu6K6Q14swk2do/scene.splinecode" className="absolute top-0 left-0 w-full h-[120%] -bottom-20" />
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10 pb-8">
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-6xl bg-white/10 backdrop-blur-sm rounded-lg px-8 py-12 text-white text-xs max-h-[80vh] flex flex-col">
          <div className="mb-6 flex-shrink-0">
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg p-2 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pb-4">
              {categories.map((category) => (
                <div key={category.title}>
                  <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li
                        key={item}
                        className="cursor-pointer hover:text-blue-400"
                        onClick={() => console.log("Category clicked:", item)}
                      >
                        {highlightText(item, searchTerm)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Category;