'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, LogIn, UserPlus, Settings } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const { user, loading, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold tracking-tighter text-white hover:text-gray-200 transition-colors">
        KPSY LAB
      </Link>
      
      <nav className="flex items-center gap-4 flex-wrap">
        <Link href="/" className="text-white hover:text-gray-200 transition-colors text-sm">
          홈
        </Link>
        <Link href="/services" className="text-white hover:text-gray-200 transition-colors text-sm">
          서비스 소개
        </Link>
        <Link href="/mnps" className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm">
          MNPS
        </Link>
        <Link href="/second-genesis" className="text-purple-300 hover:text-purple-200 transition-colors text-sm">
          Second Genesis
        </Link>
        <Link href="/blog" className="text-white hover:text-gray-200 transition-colors text-sm">
          블로그
        </Link>
        <Link href="/board" className="text-white hover:text-gray-200 transition-colors text-sm">
          게시판
        </Link>
        <Link href="/contact" className="text-white hover:text-gray-200 transition-colors text-sm">
          문의
        </Link>

        {/* 사용자 메뉴 */}
        {loading ? (
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 text-white hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">{user.username}</span>
            </button>
            
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-700">
                    <p className="text-sm font-semibold text-white">{user.username}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    {user.role === 'master' && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-yellow-900/50 text-yellow-300 rounded border border-yellow-700/50">
                        마스터
                      </span>
                    )}
                  </div>
                  {user.role === 'master' && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-yellow-300 hover:bg-gray-700 transition-colors border-b border-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      관리자 대시보드
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-1 px-3 py-2 text-sm text-white hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              로그인
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              회원가입
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

