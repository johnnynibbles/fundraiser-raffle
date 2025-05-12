interface AdminNavProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

function AdminNav({ onNavigate, currentSection }: AdminNavProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "events", label: "Events", icon: "🎉" },
    { id: "items", label: "Raffle Items", icon: "🎁" },
    { id: "orders", label: "Orders", icon: "🛍️" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav className="w-64 bg-gradient-to-b from-pink-50 to-purple-50 border-r border-pink-100 h-screen fixed">
      <div className="p-4">
        <h2 className="text-xl font-bold text-purple-600 mb-6">Admin Panel</h2>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors cursor-pointer ${
                  currentSection === item.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default AdminNav;
