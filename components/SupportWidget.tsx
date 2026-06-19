'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MessageSquare, Phone, Mail, X, Send, AlertCircle, Clock } from 'lucide-react';

export default function SupportWidget() {
  const { supportOpen, setSupportOpen, currentUser } = useApp();
  const [successMsg, setSuccessMsg] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const handleOpenToggle = () => {
    setSupportOpen(!supportOpen);
    setSuccessMsg('');
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage) return;

    // Simulate sending a direct support request
    setSuccessMsg('Obrigado! Chamado aberto com sucesso. Responderemos no seu e-mail cadastrado em breve.');
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => {
      setSuccessMsg('');
    }, 5000);
  };

  return (
    <div id="support-widget-container" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Support Dialog */}
      {supportOpen && (
        <div
          id="support-popup-window"
          className="bg-[#161616]/95 backdrop-blur-xl border border-white/10 rounded-2xl w-[320px] sm:w-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] mb-3 overflow-hidden animate-fade-in text-white"
        >
          {/* Header */}
          <div className="bg-[#f65c41] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-bold text-sm text-white">Central de Suporte Kundacine</h3>
                <span className="text-[10px] text-white/80">Online 24h • Retorno Ultra Rápido</span>
              </div>
            </div>
            <button
              onClick={handleOpenToggle}
              className="text-white hover:bg-white/10 p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Details Grid */}
          <div className="p-4 border-b border-white/5 space-y-2.5">
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
              <div className="bg-[#f65c41]/15 p-2 rounded-lg">
                <Phone className="w-4 h-4 text-[#f65c41]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Telefone e WhatsApp</p>
                <p className="text-xs font-bold text-gray-100">(11) 4002-8922 / (11) 98765-4321</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
              <div className="bg-[#f65c41]/15 p-2 rounded-lg">
                <Mail className="w-4 h-4 text-[#f65c41]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">E-mail para Suporte</p>
                <p className="text-xs font-bold text-gray-100">suporte@kundacine.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
              <Clock className="w-3 h-3 text-[#f65c41]" />
              <span>Prazo de resposta padrão de no máximo 15 minutos!</span>
            </div>
          </div>

          {/* Inline Support Ticket Form */}
          <form onSubmit={handleSubmitTicket} className="p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-200">Envie uma mensagem instantânea:</h4>
            
            <div>
              <input
                type="text"
                placeholder="Assunto (ex: Dúvida de Assinatura, Erro Player...)"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-lg p-2 text-xs text-white transition-all placeholder-gray-500"
                required
              />
            </div>

            <div>
              <textarea
                placeholder="Escreva sua mensagem aqui em detalhes..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-lg p-2 text-xs text-white transition-all placeholder-gray-500 resize-none"
                required
              />
            </div>

            {successMsg ? (
              <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-[#f65c41] hover:bg-[#ff6c54] text-white py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar Mensagem
              </button>
            )}
          </form>
        </div>
      )}

      {/* Floating Toggle Icon */}
      <button
        id="toggle-support-button"
        onClick={handleOpenToggle}
        className={`shadow-[0_8px_24px_rgba(246,92,65,0.4)] ${
          supportOpen ? 'bg-zinc-800' : 'bg-[#f65c41] hover:bg-[#ff6c54]'
        } text-white w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95`}
        title="Fale Conosco"
      >
        {supportOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

    </div>
  );
}
