import React from "react";
import { ShieldCheck, User, Lock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { cn } from "../utils/helpers";

const LoginForm: React.FC = () => {
  const {
    username, setUsername,
    password, setPassword,
    loginError, setLoginError,
    handleLogin
  } = useAppContext();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 text-sm mt-1">ระบบติดตามผลการทดลองงาน</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อผู้ใช้</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none",
                  loginError ? "border-red-500 ring-red-100" : "border-gray-200"
                )}
                placeholder="Username"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">รหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none",
                  loginError ? "border-red-500 ring-red-100" : "border-gray-200"
                )}
                placeholder="Password"
                required
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                <AlertCircle size={12} />
                {loginError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-2"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-[11px] text-indigo-700 font-medium text-center">
            <span className="font-bold">Default Login:</span> admin / admin1234
          </p>
        </div>

        <p className="text-center text-gray-400 text-[10px] mt-8 uppercase tracking-widest font-bold">
          Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
};

export default LoginForm;
