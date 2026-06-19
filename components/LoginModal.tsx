'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Mail, Lock, User as UserIcon, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, signUp, loginWithGoogleSim } = useApp();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showGoogleFakePopup, setShowGoogleFakePopup] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isSignUp) {
      if (!name) {
        setErrorMsg('Por favor, informe seu nome completo.');
        return;
      }
      const success = await signUp(email, password, name, nickname);
      if (success) {
        setSuccessMsg('Conta criada com sucesso! Você ganhou 3 dias de plano GOLD grátis para testar a vontade.');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setErrorMsg('Este e-mail já está cadastrado ou senha curta.');
      }
    } else {
      const success = await login(email, password);
      if (success) {
        setSuccessMsg('Conectado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg('E-mail ou senha incorretos.');
      }
    }
  };

  const handleGoogleSignInClick = () => {
    setShowGoogleFakePopup(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleFakeGoogleSelect = async (selectedEmail: string, selectedName: string) => {
    await loginWithGoogleSim(selectedEmail, selectedName);
    setShowGoogleFakePopup(false);
    setSuccessMsg('Autenticado com o Google com sucesso! 3 dias de Teste Gold Ativados.');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div id="login-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      
      {/* Outer Card Box */}
      <div
        id="login-modal-body"
        className="relative bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-white"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <Logo size="lg" />
          <p className="text-gray-400 text-xs mt-1.5 text-center">
            {isSignUp
              ? 'Crie sua conta para ver filmes, séries, anime e dorama!'
              : 'Entre para retomar seu catálogo de streaming.'}
          </p>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-white/5 mb-6">
          <button
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              !isSignUp ? 'border-b-2 border-[#f65c41] text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              isSignUp ? 'border-b-2 border-[#f65c41] text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400 animate-spin" />
              <span>{successMsg}</span>
            </div>
          )}

          {isSignUp && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Eliezer Moreira"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 pl-10 pr-4 text-xs text-white transition-all placeholder-gray-600"
                  />
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Nickname / Nome de Usuário
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: eliezer_vip"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 pl-10 pr-4 text-xs text-white transition-all placeholder-gray-600"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold font-mono">@</span>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              E-mail *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="nome@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 pl-10 pr-4 text-xs text-white transition-all placeholder-gray-600"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
            {!isSignUp && (
              <span className="text-[10px] text-gray-500 mt-1 block">
                Dica: Digite qualquer email e senha para conectar de imediato! Admin: `admin/admin`
              </span>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Senha de Acesso *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 pl-10 pr-4 text-xs text-white transition-all placeholder-gray-600"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#f65c41] hover:bg-[#ff6c54] text-white py-2.5 rounded-xl font-bold text-xs mt-3 transition-colors flex items-center justify-center gap-2 shadow"
          >
            <LogIn className="w-4 h-4" />
            {isSignUp ? 'Criar Conta Grátis' : 'Entrar na Plataforma'}
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative hover:opacity-100 flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <span className="relative bg-[#121212] px-3 text-[10px] text-gray-500 uppercase tracking-widest font-bold">ou continue com</span>
        </div>

        {/* Google SSO Login */}
        <button
          onClick={handleGoogleSignInClick}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-3 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-2.6-2.43-4.53-4.11-4.53z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          Cadastrar diretamente com o Google
        </button>

        {/* Simulated Google SSO Dialog */}
        {showGoogleFakePopup && (
          <div className="absolute inset-0 bg-black/95 z-50 rounded-3xl p-6 flex flex-col justify-between text-white border border-[#4285F4]/30 animate-fade-in">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 border-b border-white/5 pb-3">
                <img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" className="w-5 h-5 object-contain" alt="Google logo icon" />
                <span>Fazer login usando a sua Conta do Google</span>
              </div>
              <h4 className="text-sm font-bold text-gray-200 mt-4 mb-1">Selecione uma conta Google ativa</h4>
              <p className="text-[10px] text-gray-400">para vincular instantaneamente ao streaming KundaCine</p>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => handleFakeGoogleSelect('eliezerguimaraesmoreira@gmail.com', 'Eliezer Moreira')}
                  className="w-full text-left bg-white/5 hover:bg-[#4285F4]/10 border border-white/10 hover:border-[#4285F4]/30 p-2.5 rounded-xl flex items-center gap-3 transition-colors group"
                >
                  <img src="https://picsum.photos/seed/eliezer_photo/100/100" className="w-8 h-8 rounded-full border border-white/10" alt="avatar pic" />
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-[#4285F4] transition-colors">Eliezer Moreira</span>
                    <span className="text-[9px] text-gray-400 block break-all">eliezerguimaraesmoreira@gmail.com</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFakeGoogleSelect('canal_kundacine@gmail.com', 'Kunda Streamer')}
                  className="w-full text-left bg-white/5 hover:bg-[#4285F4]/10 border border-white/10 hover:border-[#4285F4]/30 p-2.5 rounded-xl flex items-center gap-3 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black">K</div>
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-[#4285F4] transition-colors">Kunda Streamer</span>
                    <span className="text-[9px] text-gray-400 block break-all">canal_kundacine@gmail.com</span>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowGoogleFakePopup(false)}
              className="w-full bg-[#1e1e1e] hover:bg-zinc-800 text-gray-300 py-1.5 rounded-xl text-[10px] uppercase font-bold transition-colors"
            >
              Cancelar Login Google
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
