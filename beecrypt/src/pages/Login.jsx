import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hexagon } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { DEMO_USERS } from "../data/mockData.js";

const inputCls = "w-full box-border px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E0CE] mt-1.5 mb-4 text-[14.5px] outline-none focus:border-bc-forest";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, "demo");
      navigate("/app");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-bc-cream">
      <div className="hidden md:flex flex-col justify-center p-14 relative overflow-hidden bg-gradient-to-br from-bc-deep-green to-bc-forest bc-honeycomb-bg">
        <div className="relative text-white">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Hexagon size={26} fill="#F59E0B" className="text-bc-deep-green" /> BeeCrypt
          </Link>
          <div className="font-display text-3xl mt-10 max-w-sm leading-snug">
            From hive to trust — sign in to your workspace.
          </div>
          <div className="text-[14.5px] opacity-75 mt-4 max-w-sm">
            One account, every role you're approved for — Beekeeper, Processor, Laboratory, or KVIC oversight.
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-10">
        <div className="w-full max-w-sm">
          <div className="font-display text-2xl mb-6">Welcome back 🐝</div>
          <form onSubmit={submit}>
            <label className="text-[13px] font-bold">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@beecrypt.demo" className={inputCls} />
            <label className="text-[13px] font-bold">Password</label>
            <input type="password" placeholder="demo123" className={inputCls} />
            {err && <div className="text-bc-critical text-sm -mt-2 mb-3.5">{err}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green shadow-lg disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
          <div className="text-sm text-[#8A9086] mt-4 text-center">
            Don't have an account? <Link to="/signup" className="text-bc-deep-green font-bold">Create Account</Link>
          </div>
          <div className="bg-[#F8F6EC] rounded-2xl p-4 mt-7 border border-[#ECE6D6]">
            <div className="text-[11px] font-bold text-[#8A9086] mb-2">DEMO AUTHENTICATION — click to fill</div>
            {Object.keys(DEMO_USERS).map((d) => (
              <div key={d} onClick={() => setEmail(d)} className="text-[13px] py-1.5 text-bc-deep-green font-semibold cursor-pointer">
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
