import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Chat from "./components/Chat";
import DocumentUpload from "./components/DocumentUpload";
import AuditLog from "./components/AuditLog";
import HealthBar from "./components/HealthBar";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-white">
            Sovereign AI
          </h1>
          <div className="flex gap-1">
            {[
              { to: "/", label: "Chat" },
              { to: "/upload", label: "Documents" },
              { to: "/audit", label: "Audit Log" },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <HealthBar />
        </nav>
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
