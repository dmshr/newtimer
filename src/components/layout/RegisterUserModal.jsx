"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterUserModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ username: "", password: "", role: "User" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("User berhasil didaftarkan!");
        setFormData({ username: "", password: "", role: "User" });
        onClose();
      } else {
        const error = await res.json();
        alert("Gagal: " + error.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-4">Register New Access</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Username</label>
                <input 
                  required
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-red-600 transition-colors"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Password</label>
                <input 
                  type="password" required
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-red-600 transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase ml-1">Assign Role</label>
                <select 
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-red-600 appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="SuperAdmin">Super Admin</option>
                  <option value="Master">Master</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-zinc-500 font-bold text-xs uppercase hover:text-white transition-colors">Cancel</button>
                <button disabled={loading} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-2 rounded-lg text-xs uppercase transition-all shadow-lg shadow-red-900/20">
                  {loading ? "Processing..." : "Create User"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}