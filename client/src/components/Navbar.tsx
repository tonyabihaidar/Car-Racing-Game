import { Link } from "react-router-dom";

export default function Navbar() {
  function handleLogout() {
    try {
      localStorage.removeItem("token");
    } catch (err) {
      console.error("Error clearing token:", err);
    }
    window.location.href = "/login";
  }

  return (
    <nav className="w-full bg-card border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      <Link to="/aes" className="text-xl font-bold text-white">
        AES Explorer
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link to="/dashboard" className="text-gray-300 hover:text-white">
          Dashboard
        </Link>
        <Link to="/aes" className="text-gray-300 hover:text-white">
          Visualizer
        </Link>
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
