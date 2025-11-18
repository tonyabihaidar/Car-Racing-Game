import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white px-4">
      
      {/* Heading */}
      <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
        🛡 AES Explorer
      </h1>

      <p className="text-gray-300 text-lg mb-10 text-center">
        Visualize AES-128 / AES-192 / AES-256 encryption step-by-step
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          to="/login"
          className="px-6 py-3 bg-primary hover:bg-blue-600 w-full rounded-xl text-center text-lg font-semibold transition-all shadow-lg"
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="px-6 py-3 bg-slate-600 hover:bg-slate-500 w-full rounded-xl text-center text-lg font-semibold transition-all shadow-lg"
        >
          Signup
        </Link>
      </div>
    </div>
  );
}
