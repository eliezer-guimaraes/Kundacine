'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect } from 'react';
import filmsData from '@/data/films.json';
import seriesData from '@/data/series.json';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  limit
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';

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
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogleSim: (email: string, name: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, nickname: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string, nickname: string, avatar: string) => Promise<void>;

  // Plan Token
  activateToken: (token: string) => Promise<{ success: boolean; message: string; plan?: string }>;

  // Content Interactivity
  addContentRequest: (name: string, mediaType: string) => Promise<void>;
  addGlobalChatMessage: (text: string) => Promise<void>;
  addVIPComment: (contentId: string, text: string, rating: number) => Promise<{ success: boolean; error?: string }>;
  recordWatchHistory: (content: ContentItem, progress: number, videoUrl: string, seasonNum?: number, epNum?: number, epTitle?: string) => Promise<void>;
  clearWatchHistory: () => Promise<void>;
  
  // Content CRUD
  addContent: (item: Omit<ContentItem, 'id'>) => Promise<void>;
  updateContent: (id: string, item: Partial<ContentItem>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  
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

  // 1. Listen to Content with Auto-Seeding Option
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'content'), async (snapshot) => {
      if (snapshot.empty) {
        console.log('Seeding initial mock content to Firestore catalog...');
        const writePromises = [];
        for (const film of filmsData) {
          const docRef = doc(db, 'content', film.id);
          writePromises.push(setDoc(docRef, { ...film, category: 'Filme' }));
        }
        for (const show of seriesData) {
          const docRef = doc(db, 'content', show.id);
          writePromises.push(setDoc(docRef, show));
        }
        try {
          await Promise.all(writePromises);
        } catch (err) {
          console.error('Error seeding library:', err);
        }
      } else {
        const loaded: ContentItem[] = [];
        snapshot.forEach((d) => {
          loaded.push({ ...(d.data() as ContentItem), id: d.id });
        });
        setFilms(loaded.filter(c => c.category === 'Filme'));
        setSeries(loaded.filter(c => c.category !== 'Filme'));
      }
    });

    return () => unsub();
  }, []);

  // 2. Listen to Users List
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const loaded: User[] = [];
      snapshot.forEach((d) => {
        loaded.push(d.data() as User);
      });
      setUsersList(loaded);
    });
    return () => unsub();
  }, []);

  // 3. Listen to Current Authenticated User profile
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const unsubDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser(docSnap.data() as User);
          } else {
            // Document hasn't been written yet or custom admin
            if (firebaseUser.email === 'admin@kundacine.com') {
              const adminUser: User = {
                id: firebaseUser.uid,
                name: 'Administrador Kunda',
                nickname: 'admin',
                email: 'admin@kundacine.com',
                avatar: DEFAULT_AVATAR,
                plan: 'Premium',
                trialExpiresAt: null,
                planActivatedAt: new Date().toISOString()
              };
              setDoc(docRef, adminUser);
              setCurrentUser(adminUser);
            }
          }
        });
        return () => unsubDoc();
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubAuth();
  }, []);

  // 4. Listen to Requests Sorted statically by JS to bypass indexing requirements
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const loaded: RequestedContent[] = [];
      snapshot.forEach((d) => {
        loaded.push({ ...(d.data() as RequestedContent), id: d.id });
      });
      loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRequestedContents(loaded);
    });
    return () => unsub();
  }, []);

  // 5. Listen to Global Chat (real-time chat panel)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'chat'), (snapshot) => {
      const loaded: ChatMessage[] = [];
      snapshot.forEach((d) => {
        loaded.push({ ...(d.data() as ChatMessage), id: d.id });
      });
      // Sort ascending so old messages stay above new ones
      loaded.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setGlobalChat(loaded.slice(-100)); // limit to last 100 on screen
    });
    return () => unsub();
  }, []);

  // 6. Listen to Critiques/VIP Comments
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'comments'), (snapshot) => {
      const loaded: VIPComment[] = [];
      snapshot.forEach((d) => {
        loaded.push({ ...(d.data() as VIPComment), id: d.id });
      });
      loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setVipComments(loaded);
    });
    return () => unsub();
  }, []);

  // 7. Listen to Watch History
  useEffect(() => {
    if (!currentUser) {
      setWatchHistory([]);
      return;
    }
    const unsub = onSnapshot(
      query(collection(db, 'history'), where('userId', '==', currentUser.id)),
      (snapshot) => {
        const loaded: WatchHistoryItem[] = [];
        snapshot.forEach((d) => {
          loaded.push({ ...(d.data() as WatchHistoryItem), id: d.id });
        });
        loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setWatchHistory(loaded);
      }
    );
    return () => unsub();
  }, [currentUser]);

  // Timer countdown logic for 3 Day trial
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
        const updated = { ...currentUser, plan: 'Free' as any, trialExpiresAt: null };
        setDoc(doc(db, 'users', currentUser.id), updated, { merge: true }).then(() => {
          setTrialSecondsRemaining(0);
          clearInterval(interval);
        });
      } else {
        setTrialSecondsRemaining(Math.max(0, Math.floor(diffMs / 1000)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Auth Methods (Backed by real Firebase Authentication)
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      // 1. Admin Easy-access Override Check
      if (email.trim() === 'admin' && pass === 'admin') {
        const cleanEmail = 'admin@kundacine.com';
        const cleanPass = 'admin123456';
        let fUser;
        try {
          const credentials = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
          fUser = credentials.user;
        } catch {
          const credentials = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          fUser = credentials.user;
        }

        const adminUser: User = {
          id: fUser.uid,
          name: 'Administrador Kunda',
          nickname: 'admin',
          email: cleanEmail,
          avatar: DEFAULT_AVATAR,
          plan: 'Premium',
          trialExpiresAt: null,
          planActivatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', fUser.uid), adminUser);
        setCurrentUser(adminUser);
        setView('home');
        return true;
      }

      // 2. Standard User Sign-in
      const cleanEmail = email.includes('@') ? email.trim() : `${email.trim()}@kundacine.com`;
      const cleanPass = pass.length >= 6 ? pass : 'pass123456';
      
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        setView('home');
        return true;
      } catch (err: any) {
        // If credentials are invalid / not registered, let's auto-register them seamlessly!
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            const creds = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
            const testExpiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
            const name = email.split('@')[0];
            const newUser: User = {
              id: creds.user.uid,
              name: name,
              nickname: name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 100),
              email: cleanEmail,
              avatar: DEFAULT_AVATAR,
              plan: 'Testador',
              trialExpiresAt: testExpiration,
              planActivatedAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', creds.user.uid), newUser);
            setCurrentUser(newUser);
            setView('home');
            return true;
          } catch (signUpErr) {
            console.error('Seamless registration error:', signUpErr);
          }
        }
        console.error('Firebase Auth sign in error:', err);
        return false;
      }
    } catch (err) {
      console.error('Login action error:', err);
      return false;
    }
  };

  const signUp = async (email: string, pass: string, name: string, nickname: string): Promise<boolean> => {
    try {
      const cleanEmail = email.includes('@') ? email.trim() : `${email.trim()}@kundacine.com`;
      const cleanPass = pass.length >= 6 ? pass : 'pass123456';
      
      const creds = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const testExpiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const newUser: User = {
        id: creds.user.uid,
        name: name,
        nickname: nickname || name.toLowerCase().replace(/\s+/g, '_'),
        email: cleanEmail,
        avatar: DEFAULT_AVATAR,
        plan: 'Testador',
        trialExpiresAt: testExpiration,
        planActivatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', creds.user.uid), newUser);
      setCurrentUser(newUser);
      setView('home');
      return true;
    } catch (err) {
      console.error('Firebase Auth sign up error:', err);
      return false;
    }
  };

  const loginWithGoogleSim = async (email: string, name: string) => {
    try {
      const simulatedPass = 'google_pass_123456';
      let creds;
      try {
        creds = await signInWithEmailAndPassword(auth, email, simulatedPass);
      } catch {
        creds = await createUserWithEmailAndPassword(auth, email, simulatedPass);
      }

      const userDocSnap = await getDoc(doc(db, 'users', creds.user.uid));
      if (!userDocSnap.exists()) {
        const testExpiration = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const newUser: User = {
          id: creds.user.uid,
          name: name,
          nickname: name.toLowerCase().replace(/\s+/g, '_') || 'google_user',
          email: email,
          avatar: DEFAULT_AVATAR,
          plan: 'Testador',
          trialExpiresAt: testExpiration,
          planActivatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', creds.user.uid), newUser);
        setCurrentUser(newUser);
      }
      setView('home');
    } catch (err) {
      console.error('Google Sim auth error:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setView('home');
      setSelectedContent(null);
      setPlayingEpisode(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const updateProfile = async (name: string, nickname: string, avatar: string) => {
    if (!currentUser) return;
    try {
      const cleanNick = nickname.toLowerCase().replace(/\s+/g, '_');
      const updated = { ...currentUser, name, nickname: cleanNick, avatar };
      await setDoc(doc(db, 'users', currentUser.id), updated, { merge: true });
      setCurrentUser(updated);
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const activateToken = async (token: string): Promise<{ success: boolean; message: string; plan?: string }> => {
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

    try {
      const updated = {
        ...currentUser,
        plan: resolvedPlan,
        trialExpiresAt: null,
        planActivatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', currentUser.id), updated, { merge: true });
      setCurrentUser(updated);

      return { 
        success: true, 
        message: `Sucesso! Seu plano foi ativado para ${resolvedPlan} mediante validação do token (Mês da compra: Mês ${x}, Ano: 202${y}).`,
        plan: resolvedPlan
      };
    } catch (err) {
      console.error('Token Activation Error:', err);
      return { success: false, message: 'Falha ao processar a ativação do token no banco de dados.' };
    }
  };

  // User requests new content
  const addContentRequest = async (name: string, mediaType: string) => {
    const userNick = currentUser ? currentUser.nickname : 'Visitante';
    const newReq: RequestedContent = {
      id: Math.random().toString(36).substring(2, 9),
      name: name,
      mediaType: mediaType,
      userNickname: userNick,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'requests', newReq.id), newReq);
    } catch (err) {
      console.error('Send content request error:', err);
    }
  };

  // Real-time Chat
  const addGlobalChatMessage = async (text: string) => {
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

    try {
      await setDoc(doc(db, 'chat', newMessage.id), newMessage);
    } catch (err) {
      console.error('Send global chat message error:', err);
    }
  };

  // Critiques/VIP comments
  const addVIPComment = async (contentId: string, text: string, rating: number): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Você precisa estar logado para comentar.' };
    }

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

    try {
      await setDoc(doc(db, 'comments', newComment.id), newComment);
      return { success: true };
    } catch (err) {
      console.error('Post critique error:', err);
      return { success: false, error: 'Erro ao postar crítica no banco de dados.' };
    }
  };

  // Watch History Tracking
  const recordWatchHistory = async (
    content: ContentItem, 
    progress: number, 
    videoUrl: string, 
    seasonNum?: number, 
    epNum?: number, 
    epTitle?: string
  ) => {
    if (!currentUser) return;

    const trackerId = `${currentUser.id}_${content.id}${seasonNum ? '_s' + seasonNum : ''}${epNum ? '_e' + epNum : ''}`;

    const newItem = {
      id: trackerId,
      userId: currentUser.id,
      contentId: content.id,
      contentType: content.category,
      title: content.title,
      cover: content.coverMobile || content.coverDesktop,
      progress: progress,
      seasonNumber: seasonNum || null,
      episodeNumber: epNum || null,
      episodeTitle: epTitle || null,
      videoUrl: videoUrl,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'history', trackerId), newItem);
    } catch (err) {
      console.error('Record watch progress error:', err);
    }
  };

  const clearWatchHistory = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'history'), where('userId', '==', currentUser.id));
      const querySnapshot = await getDocs(q);
      const deletePromises: Promise<void>[] = [];
      querySnapshot.forEach((docSnap) => {
        deletePromises.push(deleteDoc(docSnap.ref));
      });
      await Promise.all(deletePromises);
    } catch (err) {
      console.error('Clear watch progress library index:', err);
    }
  };

  // Content CRUD implementations for Admins
  const addContent = async (item: Omit<ContentItem, 'id'>) => {
    const cleanId = item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.floor(Math.random() * 1000);
    const newItem: ContentItem = {
      ...item,
      id: cleanId
    };
    try {
      await setDoc(doc(db, 'content', cleanId), newItem);
    } catch (err) {
      console.error('Add catalog item error:', err);
    }
  };

  const updateContent = async (id: string, updatedFields: Partial<ContentItem>) => {
    try {
      await updateDoc(doc(db, 'content', id), updatedFields);
    } catch (err) {
      console.error('Update catalog item error:', err);
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'content', id));
    } catch (err) {
      console.error('Delete catalog item error:', err);
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
