'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import Logo from '@/components/Logo';
import { Search, User as UserIcon, LogOut, Shield, Settings, CreditCard, Sparkles, X } from 'lucide-react';

interface HeaderProps {
  onOpenLoginModal: () => void;
}

export default function Header({ onOpenLoginModal }: HeaderProps) {
  const {
    currentUser,
    logout,
    setView,
    activeView,
    allContent,
    setSelectedContent,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter shows based on query
  const suggestions = searchQuery.trim()
    ? allContent.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleSuggestionClick = (item: any) => {
    setSelectedContent(item);
    setSearchQuery('');
    setShowSearchSuggestions(false);
    setView('home'); // Go to detail layout
  };

  const handleNavigation = (view: typeof activeView) => {
    setView(view);
    setSelectedContent(null);
  };

  return (
    <header
      id="kundacine-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#101010]/85 backdrop-blur-xl border-b border-white/5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
          : 'bg-gradient-to-b from-[#101010] to-[#101010]/0 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <button 
          onClick={() => handleNavigation('home')} 
          className="cursor-pointer active:scale-95 transition-transform"
          id="logo-nav-button"
        >
          <Logo size="md" />
        </button>

        {/* Categories Shortcut */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <button
            id="nav-filmes"
            onClick={() => handleNavigation('films')}
            className={`cursor-pointer hover:text-white transition-colors py-1 relative ${
              activeView === 'films' ? 'text-[#f65c41] font-bold' : ''
            }`}
          >
            Filmes
            {activeView === 'films' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f65c41] rounded" />
            )}
          </button>
          <button
            id="nav-series"
            onClick={() => handleNavigation('series')}
            className={`cursor-pointer hover:text-white transition-colors py-1 relative ${
              activeView === 'series' ? 'text-[#f65c41] font-bold' : ''
            }`}
          >
            Séries
            {activeView === 'series' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f65c41] rounded" />
            )}
          </button>
          <button
            id="nav-animes"
            onClick={() => handleNavigation('animes')}
            className={`cursor-pointer hover:text-white transition-colors py-1 relative ${
              activeView === 'animes' ? 'text-[#f65c41] font-bold' : ''
            }`}
          >
            Animes
            {activeView === 'animes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f65c41] rounded" />
            )}
          </button>
          <button
            id="nav-doramas"
            onClick={() => handleNavigation('doramas')}
            className={`cursor-pointer hover:text-white transition-colors py-1 relative ${
              activeView === 'doramas' ? 'text-[#f65c41] font-bold' : ''
            }`}
          >
            Doramas
            {activeView === 'doramas' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f65c41] rounded" />
            )}
          </button>
          <button
            id="nav-planos"
            onClick={() => handleNavigation('plans')}
            className={`cursor-pointer hover:text-white transition-colors py-1 relative ${
              activeView === 'plans' ? 'text-[#f65c41] font-bold' : ''
            }`}
          >
            Planos
            {activeView === 'plans' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f65c41] rounded" />
            )}
          </button>
        </nav>

        {/* Right side utilities */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 md:flex-none justify-end">
          
          {/* Functional Search input bar with suggestions */}
          <div ref={searchRef} className="relative max-w-[160px] sm:max-w-[240px] w-full" id="search-container">
            <div className="relative">
              <input
                id="search-input"
                type="text"
                placeholder="Buscar títulos, gêneros..."
                value={searchQuery}
                onFocus={() => setShowSearchSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                className="w-full bg-white/5 border border-white/10 hover:border-white/25 focus:border-[#f65c41]/50 outline-none rounded-full py-1.5 pl-9 pr-8 text-xs text-white transition-all duration-300 placeholder-gray-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live suggestions drop-down */}
            {showSearchSuggestions && searchQuery.trim() && (
              <div
                id="search-suggestions-dropdown"
                className="absolute right-0 left-0 mt-2 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden max-h-80 overflow-y-auto animate-fade-in"
              >
                <div className="text-[10px] text-gray-400 font-semibold px-2.5 py-1.5 uppercase tracking-wider border-b border-white/5">
                  Resultados da escrita
                </div>
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full text-left px-2.5 py-2 hover:bg-white/5 text-xs text-white flex items-center gap-3 transition-colors rounded-lg group"
                    >
                      <img
                        src={item.coverMobile}
                        alt={item.title}
                        className="w-8 h-12 object-cover rounded shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate group-hover:text-[#f65c41] transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span className="text-[#f65c41]">★ {item.rating}</span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center text-xs text-gray-500 py-6">
                    Nenhum título sugerido encontrado
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Sign In or User Settings Menu */}
          {currentUser ? (
            <div ref={userMenuRef} className="relative z-50" id="user-menu-container">
              <button
                id="user-avatar-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f65c41]/50 rounded-full p-0.5"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar || 'https://tse4.mm.bing.net/th/id/OIP.23wzRzOwtSR-WAQZM4mWzAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/10 hover:border-[#f65c41] transition-color shadow"
                  />
                  {currentUser.plan && (
                    <span 
                      id="vip-badge" 
                      className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-[8px] font-black tracking-tighter text-black px-1 rounded-full border border-[#101010] uppercase"
                    >
                      {currentUser.plan === 'Testador' ? 'TESTE' : currentUser.plan}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs text-gray-300 font-semibold max-w-[90px] truncate">
                  {currentUser.nickname}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div
                  id="user-menu-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in"
                >
                  <div className="px-3 py-2.5 border-b border-white/5">
                    <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{currentUser.email}</p>
                    
                    {/* Active Plan Pill */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">
                        Plano: {currentUser.plan === 'Testador' ? 'Gold (Teste 3 Dias)' : currentUser.plan}
                      </span>
                    </div>
                  </div>

                  <div className="p-1 space-y-1">
                    <button
                      id="dropdown-profile"
                      onClick={() => {
                        handleNavigation('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Meu Perfil
                    </button>
                    
                    <button
                      id="dropdown-plans"
                      onClick={() => {
                        handleNavigation('plans');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2.5 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      Assinar Planos
                    </button>

                    {/* Admin view button if user is verified admin */}
                    {(currentUser.nickname === 'admin' || currentUser.email === 'admin') && (
                      <button
                        id="dropdown-admin"
                        onClick={() => {
                          handleNavigation('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#f65c41] font-semibold hover:bg-white/5 rounded-lg flex items-center gap-2.5 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Painel Admin
                      </button>
                    )}
                  </div>

                  <div className="p-1 border-t border-white/5">
                    <button
                      id="dropdown-logout"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={onOpenLoginModal}
              className="bg-[#f65c41] hover:bg-[#ff6c54] text-white px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-[0_4px_12px_rgba(246,92,65,0.3)] hover:shadow-[0_4px_20px_rgba(246,92,65,0.5)]"
            >
              Entrar ou Criar Conta
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
