'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect } from 'react';
import filmsData from '@/data/films.json';
import seriesData from '@/data/series.json';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  videoUrl?: string; // Movies have this
  coverMobile: string;
  coverDesktop: string;
  backgroundMobile: string;
  backgroundDesktop: string;
  rating: number;
  year: number;
  genres: string[];
  uploadDate: string;
  category: 'Filme' | 'Série' | 'Anime' | 'Dorama';
  ageRating?: string; // e.g. "Livre", "10+", "12+", "14+", "16+", "18+"
  seasons?: {
    number: number;
    name: string;
    episodes: {
      number: number;
      title: string;
      videoUrl: string;
      duration: string;
    }[];
  }[];
}

export interface User {
  id: string;
  name: string;
  nickname: string;
  email: string;
  avatar: string;
  plan: 'Testador' | 'Básico' | 'Gold' | 'Premium'; // Testador corresponds to 3-day test trial (has gold privileges)
  trialExpiresAt: string | null;
  planActivatedAt: string | null;
}

export interface RequestedContent {
  id: string;
  name: string;
  mediaType: string; // 'Filme' | 'Série' | 'Anime' | 'Dorama'
  userNickname: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  userName: string;
  userNickname: string;
  userPlan: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface VIPComment {
  id: string;
  contentId: string;
  userName: string;
  userNickname: string;
  userPlan: string;
  avatar: string;
  text: string;
  rating: number;
  timestamp: string;
}

export interface WatchHistoryItem {
  id: string;
  contentId: string;
  contentType: string;
  title: string;
  cover: string;
  progress: number; // percentage
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  videoUrl: string;
  timestamp: string;
}

interface AppContextType {
  currentUser: User | null;
  usersList: User[];
  films: ContentItem[];
  series: ContentItem[];
  allContent: ContentItem[];
  requestedContents: RequestedContent[];
  globalChat: ChatMessage[];
  vipComments: VIPComment[];
  watchHistory: WatchHistoryItem[];
  activeView: 'home' | 'films' | 'series' | 'animes' | 'doramas' | 'plans' | 'profile' | 'admin' | 'terms' | 'privacy';
  selectedContent: ContentItem | null;
  activePlayingEpisode: {
    videoUrl: string;
    content: ContentItem;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
  } | null;
  supportOpen: boolean;
  trialSecondsRemaining: number;
  
  // Auth & Session
  login: (email: string, pass: string) => boolean;
  loginWithGoogleSim: (email: string, name: string) => void;
  signUp: (email: string, pass: string, name: string, nickname: string) => boolean;
  logout: () => void;
  updateProfile: (name: string, nickname: string, avatar: string) => void;

  // Plan Token
  activateToken: (token: string) => { success: boolean; message: string; plan?: string };

  // Content Interactivity
  addContentRequest: (name: string, mediaType: string) => void;
  addGlobalChatMessage: (text: string) => void;
  addVIPComment: (contentId: string, text: string, rating: number) => { success: boolean; error?: string };
  recordWatchHistory: (content: ContentItem, progress: number, videoUrl: string, seasonNum?: number, epNum?: number, epTitle?: string) => void;
  clearWatchHistory: () => void;
  
  // Content CRUD
  addContent: (item: Omit<ContentItem, 'id'>) => void;
  updateContent: (id: string, item: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  
  // UI Controls
  setView: (view: 'home' | 'films' | 'series' | 'animes' | 'doramas' | 'plans' | 'profile' | 'admin' | 'terms' | 'privacy') => void;
  setSelectedContent: (content: ContentItem | null) => void;
  setPlayingEpisode: (episode: { videoUrl: string; content: ContentItem; seasonNumber?: number; episodeNumber?: number; episodeTitle?: string } | null) => void;
  setSupportOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DEFAULT_AVATAR = 'https://tse4.mm.bing.net/th/id/OIP.23wzRzOwtSR-WAQZM4mWzAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [films, setFilms] = useState<ContentItem[]>([]);
  const [series, setSeries] = useState<ContentItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [requestedContents, setRequestedContents] = useState<RequestedContent[]>([]);
  const [globalChat, setGlobalChat] = useState<ChatMessage[]>([]);
  const [vipComments, setVipComments] = useState<VIPComment[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [activeView, setView] = useState<'home' | 'films' | 'series' | 'animes' | 'doramas' | 'plans' | 'profile' | 'admin' | 'terms' | 'privacy'>('home');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [activePlayingEpisode, setPlayingEpisode] = useState<AppContextType['activePlayingEpisode']>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trialSecondsRemaining, setTrialSecondsRemaining] = useState(0);

  const allContent = [...films, ...series];

  // Load Initial State
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFilms = localStorage.getItem('kundacine_films');
      if (storedFilms) {
        setFilms(JSON.parse(storedFilms));
      } else {
        setFilms(filmsData as ContentItem[]);
      }

      const storedSeries = localStorage.getItem('kundacine_series');
      if (storedSeries) {
        setSeries(JSON.parse(storedSeries));
      } else {
        setSeries(seriesData as ContentItem[]);
      }

      const storedUsers = localStorage.getItem('kundacine_users');
      const loadedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      setUsersList(loadedUsers);

      const storedUser = localStorage.getItem('kundacine_currentUser');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
      }

      const storedRequests = localStorage.getItem('kundacine_requests');
      const loadedRequests = storedRequests ? JSON.parse(storedRequests) : [
        { id: '1', name: 'Demon Slayer: Hashira Training Arc', mediaType: 'Anime', userNickname: 'otaku_br', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', name: 'Beleza Verdadeira (True Beauty)', mediaType: 'Dorama', userNickname: 'dorama_love', timestamp: new Date(Date.now() - 7200000).toISOString() }
      ];
      setRequestedContents(loadedRequests);

      const storedChat = localStorage.getItem('kundacine_chat');
      const loadedChat = storedChat ? JSON.parse(storedChat) : [
        { id: '1', userName: 'Admin de Kunda', userNickname: 'admin', userPlan: 'Premium', avatar: DEFAULT_AVATAR, content: 'Sejam bem-vindos ao chat de streaming oficial do KundaCine! 🎬🍿', timestamp: new Date(Date.now() - 1200000).toISOString() },
        { id: '2', userName: 'Rodrigo Silva', userNickname: 'rodrigo_vip', userPlan: 'Premium', avatar: 'https://picsum.photos/seed/user_rodrigo/150/150', content: 'Incrível essa plataforma! O carregamento é ultra rápido de verdade!', timestamp: new Date(Date.now() - 900000).toISOString() },
        { id: '3', userName: 'Mariana Costa', userNickname: 'mari_p', userPlan: 'Gold', avatar: 'https://picsum.photos/seed/user_mari/150/150', content: 'Alguém assistindo Noite Eterna agora? Que fotografia fantástica!', timestamp: new Date(Date.now() - 300000).toISOString() }
      ];
      setGlobalChat(loadedChat);

      const storedVipComments = localStorage.getItem('kundacine_comments');
      const loadedComments = storedVipComments ? JSON.parse(storedVipComments) : [
        { id: 'c1', contentId: 'noite-eterna', userName: 'Admin de Kunda', userNickname: 'admin', userPlan: 'Premium', avatar: DEFAULT_AVATAR, text: 'Filme excepcional! Uma ficção científica brasileira autêntica e intrigante.', rating: 5, timestamp: '2026-06-12T14:20:00Z' },
        { id: 'c2', contentId: 'sussurros-do-passado', userName: 'Admin de Kunda', userNickname: 'admin', userPlan: 'Premium', avatar: DEFAULT_AVATAR, text: 'Muito bom o suspense! Te deixa preso na cadeira até os minutos finais.', rating: 4.8, timestamp: '2026-06-15T10:15:00Z' }
      ];
      setVipComments(loadedComments);

      const storedHistory = localStorage.getItem('kundacine_history');
      const loadedHistory = storedHistory ? JSON.parse(storedHistory) : [];
      setWatchHistory(loadedHistory);
    }
  }, []);

  // Save changes to localStorage helper
  const saveUsers = (newList: User[]) => {
    localStorage.setItem('kundacine_users', JSON.stringify(newList));
    setUsersList(newList);
  };

  const saveCurrentUser = (user: User | null) => {
    if (user) {
      localStorage.setItem('kundacine_currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('kundacine_currentUser');
    }
    setCurrentUser(user);
  };

  const saveRequests = (reqs: RequestedContent[]) => {
    localStorage.setItem('kundacine_requests', JSON.stringify(reqs));
    setRequestedContents(reqs);
  };

  const saveChat = (messages: ChatMessage[]) => {
    localStorage.setItem('kundacine_chat', JSON.stringify(messages));
    setGlobalChat(messages);
  };

  const saveVipComments = (comments: VIPComment[]) => {
    localStorage.setItem('kundacine_comments', JSON.stringify(comments));
    setVipComments(comments);
  };

  const saveHistory = (items: WatchHistoryItem[]) => {
    localStorage.setItem('kundacine_history', JSON.stringify(items));
    setWatchHistory(items);
  };

  // Timer logic for 3 Day Trial Countdown (72 hours)
  useEffect(() => {
    if (!currentUser || currentUser.plan !== 'Testador' || !currentUser.trialExpiresAt) {
      setTrialSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiration = new Date(currentUser.trialExpiresAt!).getTime();
      const diffMs = expiration - now;

      if (diffMs <= 0) {
        // Expired Trial - Let's downgrade them to simple free tier or locked test account
        const updated = { ...currentUser, plan: 'Free' as any, trialExpiresAt: null };
        saveCurrentUser(updated);
        const updatedList = usersList.map(u => u.id === currentUser.id ? updated : u);
        saveUsers(updatedList);
        setTrialSecondsRemaining(0);
        clearInterval(interval);
      } else {
        setTrialSecondsRemaining(Math.max(0, Math.floor(diffMs / 1000)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser, usersList]);

  // Auth Methods
  const login = (email: string, pass: string): boolean => {
    // Admin Override checking
    if (email.trim() === 'admin' && pass === 'admin') {
      const adminUser: User = {
        id: 'admin-id',
        name: 'Administrador Kunda',
        nickname: 'admin',
        email: 'admin',
        avatar: DEFAULT_AVATAR,
        plan: 'Premium', // Admin behaves as Premium
        trialExpiresAt: null,
        planActivatedAt: new Date().toISOString()
      };
      saveCurrentUser(adminUser);
      return true;
    }

    // Standard User lookup
    const foundUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      saveCurrentUser(foundUser);
      return true;
    }

    // Auto-create standard user with 3-day test trial for instant convenience on first login! This is user friendly!
    const testExpiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0],
      nickname: email.split('@')[0] + '_vip',
      email: email,
      avatar: DEFAULT_AVATAR,
      plan: 'Testador',
      trialExpiresAt: testExpiration,
      planActivatedAt: new Date().toISOString()
    };
    const updatedUsers = [...usersList, newUser];
    saveUsers(updatedUsers);
    saveCurrentUser(newUser);
    return true;
  };

  const loginWithGoogleSim = (email: string, name: string) => {
    const foundUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      saveCurrentUser(foundUser);
      return;
    }

    // Create New Account via Google Sim (3 Days trial!)
    const testExpiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: name,
      nickname: name.toLowerCase().replace(/\s+/g, '_') || 'google_user',
      email: email,
      avatar: DEFAULT_AVATAR,
      plan: 'Testador',
      trialExpiresAt: testExpiration,
      planActivatedAt: new Date().toISOString()
    };
    const updatedUsers = [...usersList, newUser];
    saveUsers(updatedUsers);
    saveCurrentUser(newUser);
  };

  const signUp = (email: string, pass: string, name: string, nickname: string): boolean => {
    const exists = usersList.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    const testExpiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name: name,
      nickname: nickname || name.toLowerCase().replace(/\s+/g, '_'),
      email: email,
      avatar: DEFAULT_AVATAR,
      plan: 'Testador', // 3 Days test behaving as gold
      trialExpiresAt: testExpiration,
      planActivatedAt: new Date().toISOString()
    };

    const updatedUsers = [...usersList, newUser];
    saveUsers(updatedUsers);
    saveCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('kundacine_currentUser');
    setCurrentUser(null);
    setView('home');
    setSelectedContent(null);
    setPlayingEpisode(null);
  };

  const updateProfile = (name: string, nickname: string, avatar: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, name, nickname, avatar };
    saveCurrentUser(updated);

    if (currentUser.id !== 'admin-id') {
      const updatedList = usersList.map(u => u.id === currentUser.id ? updated : u);
      saveUsers(updatedList);
    }
  };

  // Plan Token activation logic
  // Token logic: K0xyz
  // x: month number (e.g. 1-12)
  // y: last digit of year (e.g. 6)
  // z: plan code (0 = Básico, 1 = Gold, 2 = Premium)
  const activateToken = (token: string): { success: boolean; message: string; plan?: string } => {
    if (!currentUser) return { success: false, message: 'Usuário não conectado.' };
    
    const cleanToken = token.trim();
    if (!/^K0\d{3}$/.test(cleanToken)) {
      return { success: false, message: 'Formato de token inválido! O token deve ser no formato K0xyz.' };
    }

    const xStr = cleanToken.substring(2, 3);
    const yStr = cleanToken.substring(3, 4);
    const zStr = cleanToken.substring(4, 5);

    const x = parseInt(xStr);
    const y = parseInt(yStr);
    const z = parseInt(zStr);

    if (x < 1 || x > 12) {
      return { success: false, message: 'Mês de ativação inválido embutido no token (deve ser 1-12).' };
    }

    let resolvedPlan: 'Básico' | 'Gold' | 'Premium';
    if (z === 0) resolvedPlan = 'Básico';
    else if (z === 1) resolvedPlan = 'Gold';
    else if (z === 2) resolvedPlan = 'Premium';
    else {
      return { success: false, message: 'Identificador de plano inválido no token (z deve ser 0, 1 ou 2).' };
    }

    // Upgrade is valid! Let's clear trial settings and upgrade
    const updated = {
      ...currentUser,
      plan: resolvedPlan,
      trialExpiresAt: null,
      planActivatedAt: new Date().toISOString()
    };

    saveCurrentUser(updated);

    if (currentUser.id !== 'admin-id') {
      const updatedList = usersList.map(u => u.id === currentUser.id ? updated : u);
      saveUsers(updatedList);
    }

    return { 
      success: true, 
      message: `Sucesso! Seu plano foi ativado para ${resolvedPlan} mediante validação do token (Mês da compra: Mês ${x}, Ano: 202${y}).`,
      plan: resolvedPlan
    };
  };

  // User request missing content
  const addContentRequest = (name: string, mediaType: string) => {
    const userNick = currentUser ? currentUser.nickname : 'Visitante';
    const newReq: RequestedContent = {
      id: Math.random().toString(36).substring(2, 9),
      name: name,
      mediaType: mediaType,
      userNickname: userNick,
      timestamp: new Date().toISOString()
    };

    const updated = [newReq, ...requestedContents];
    saveRequests(updated);
  };

  // Interactive Live Chat
  const addGlobalChatMessage = (text: string) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      userName: currentUser.name,
      userNickname: currentUser.nickname,
      userPlan: currentUser.plan,
      avatar: currentUser.avatar || DEFAULT_AVATAR,
      content: text,
      timestamp: new Date().toISOString()
    };

    const updated = [...globalChat, newMessage];
    saveChat(updated);
  };

  // Comments - Only for Premium members
  const addVIPComment = (contentId: string, text: string, rating: number): { success: boolean; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'Você precisa estar logado para comentar.' };
    }

    // Only Premium members can comment on movies/series pages
    if (currentUser.plan !== 'Premium') {
      return { 
        success: false, 
        error: `Acesso Restrito: Somente assinantes do Plano Premium podem postar críticas sobre os conteúdos. Faça o upgrade por apenas R$ 87,00/mês para desbloquear!` 
      };
    }

    const newComment: VIPComment = {
      id: Math.random().toString(36).substring(2, 9),
      contentId: contentId,
      userName: currentUser.name,
      userNickname: currentUser.nickname,
      userPlan: currentUser.plan,
      avatar: currentUser.avatar || DEFAULT_AVATAR,
      text: text,
      rating: rating,
      timestamp: new Date().toISOString()
    };

    const updated = [newComment, ...vipComments];
    saveVipComments(updated);
    return { success: true };
  };

  // Play tracking to Feed Continue Assistindo
  const recordWatchHistory = (
    content: ContentItem, 
    progress: number, 
    videoUrl: string, 
    seasonNum?: number, 
    epNum?: number, 
    epTitle?: string
  ) => {
    // If guest, don't save
    if (!currentUser) return;

    // Remove existing history item for the same show to update order & position
    let baseHistory = [...watchHistory];
    
    // We check if it matches contentId and episode details if series or just contentId for movies
    baseHistory = baseHistory.filter(item => {
      if (item.contentId !== content.id) return true;
      if (seasonNum && item.seasonNumber !== seasonNum) return true;
      if (epNum && item.episodeNumber !== epNum) return true;
      return false;
    });

    const newItem: WatchHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      contentId: content.id,
      contentType: content.category,
      title: content.title,
      cover: content.coverMobile || content.coverDesktop,
      progress: progress,
      seasonNumber: seasonNum,
      episodeNumber: epNum,
      episodeTitle: epTitle,
      videoUrl: videoUrl,
      timestamp: new Date().toISOString()
    };

    const updated = [newItem, ...baseHistory];
    saveHistory(updated);
  };

  const clearWatchHistory = () => {
    saveHistory([]);
  };

  // Content CRUD implementation
  const addContent = (item: Omit<ContentItem, 'id'>) => {
    const newItem: ContentItem = {
      ...item,
      id: item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.floor(Math.random() * 1000)
    };
    if (newItem.category === 'Filme') {
      const updatedFilms = [...films, newItem];
      setFilms(updatedFilms);
      localStorage.setItem('kundacine_films', JSON.stringify(updatedFilms));
    } else {
      const updatedSeries = [...series, newItem];
      setSeries(updatedSeries);
      localStorage.setItem('kundacine_series', JSON.stringify(updatedSeries));
    }
  };

  const updateContent = (id: string, updatedFields: Partial<ContentItem>) => {
    const isFilm = films.some(f => f.id === id);
    if (isFilm) {
      const updatedFilms = films.map(f => f.id === id ? { ...f, ...updatedFields } as ContentItem : f);
      setFilms(updatedFilms);
      localStorage.setItem('kundacine_films', JSON.stringify(updatedFilms));
    } else {
      const updatedSeries = series.map(s => s.id === id ? { ...s, ...updatedFields } as ContentItem : s);
      setSeries(updatedSeries);
      localStorage.setItem('kundacine_series', JSON.stringify(updatedSeries));
    }
  };

  const deleteContent = (id: string) => {
    const updatedFilms = films.filter(f => f.id !== id);
    if (updatedFilms.length !== films.length) {
      setFilms(updatedFilms);
      localStorage.setItem('kundacine_films', JSON.stringify(updatedFilms));
    }
    const updatedSeries = series.filter(s => s.id !== id);
    if (updatedSeries.length !== series.length) {
      setSeries(updatedSeries);
      localStorage.setItem('kundacine_series', JSON.stringify(updatedSeries));
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        usersList,
        films,
        series,
        allContent,
        requestedContents,
        globalChat,
        vipComments,
        watchHistory,
        activeView,
        selectedContent,
        activePlayingEpisode,
        supportOpen,
        trialSecondsRemaining,
        
        login,
        loginWithGoogleSim,
        signUp,
        logout,
        updateProfile,
        
        activateToken,
        
        addContentRequest,
        addGlobalChatMessage,
        addVIPComment,
        recordWatchHistory,
        clearWatchHistory,
        
        addContent,
        updateContent,
        deleteContent,
        
        setView,
        setSelectedContent,
        setPlayingEpisode,
        setSupportOpen,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
