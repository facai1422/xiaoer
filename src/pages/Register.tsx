import { useNavigate, useSearchParams } from "react-router-dom";
import { RegisterForm } from "@/components/register/RegisterForm";
import { LoginOptions } from "@/components/register/LoginOptions";
import { ServiceGrid } from "@/components/register/ServiceGrid";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inviteCodeFromUrl, setInviteCodeFromUrl] = useState<string>("");

  useEffect(() => {
    // 获取URL参数中的邀请码
    const codeParam = searchParams.get('code') || searchParams.get('invite') || searchParams.get('inviteCode');
    if (codeParam) {
      setInviteCodeFromUrl(codeParam.trim().toUpperCase());
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 渐变背景和波浪效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#543ab7] to-[#00acc1]">
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="waves relative w-full h-[15vh] min-h-[100px] max-h-[150px]" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
              <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="parallax">
              <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255, 255, 255, 0.7)" className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-2s]" />
              <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255, 255, 255, 0.5)" className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-3s]" />
              <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255, 255, 255, 0.3)" className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-4s]" />
              <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" className="animate-[move-forever_25s_cubic-bezier(.55,.5,.45,.5)_infinite_-5s]" />
            </g>
          </svg>
        </div>
      </div>

      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 bg-transparent p-4 flex items-center justify-between z-10">
        <button type="button" onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center text-white" title="返回">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <Bell className="w-6 h-6 text-white" />
      </div>

      {/* 主要内容 */}
      <div className="relative px-6 pt-20 z-10">
        <div className="text-center mb-12">
          <h1 className="mb-3 text-7xl font-bold text-white">惠享生活</h1>
          <p className="text-white/80 text-sm">信息加密、智能交易、资金全额承保</p>
          {inviteCodeFromUrl && (
            <p className="text-blue-200 text-sm mt-2">
              邀请码: {inviteCodeFromUrl} 已自动填入
            </p>
          )}
        </div>

        <RegisterForm 
          onSuccess={() => navigate("/dashboard")} 
          defaultInviteCode={inviteCodeFromUrl}
        />
        <LoginOptions />
        <ServiceGrid />
      </div>
    </div>
  );
};

export default Register;
