'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp, ContentItem, VIPComment, WatchHistoryItem } from '@/context/AppContext';
import Header from '@/components/Header';
import SupportWidget from '@/components/SupportWidget';
import TrialCountdownBar from '@/components/TrialCountdownBar';
import LoginModal from '@/components/LoginModal';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import Logo from '@/components/Logo';
import { 
  Star, Play, ArrowLeft, Check, Lock, ShieldAlert, MessageSquare, 
  Calendar, Clock, Send, Laptop, Tv, Settings, AlertCircle, 
  Trash2, Plus, Search, Sparkles, Download, UserCheck, CheckCircle2,
  ListFilter, AlertTriangle, ExternalLink, Instagram, Twitter, Youtube, Mail, Smile, Trophy,
  X
} from 'lucide-react';

export default function KundacineHome() {
  const {
    currentUser,
    films,
    series,
    allContent,
    requestedContents,
    globalChat,
    vipComments,
    watchHistory,
    activeView,
    setView,
    selectedContent,
    setSelectedContent,
    setPlayingEpisode,
    addContentRequest,
    addGlobalChatMessage,
    addVIPComment,
    clearWatchHistory,
    activateToken,
    addContent,
    updateContent,
    deleteContent,
    updateProfile
  } = useApp();

  // Modal Open states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);

  // Search recommendation inputs
  const [missingName, setMissingName] = useState('');
  const [missingType, setMissingType] = useState('Filme');
  const [missingSuccess, setMissingSuccess] = useState(false);

  // For comments and chats input
  const [critiqueText, setCritiqueText] = useState('');
  const [critiqueRating, setCritiqueRating] = useState(5);
  const [critiqueError, setCritiqueError] = useState('');
  const [critiqueSuccess, setCritiqueSuccess] = useState(false);

  const [chatMessageText, setChatMessageText] = useState('');

  // Series selector states (Content Detail Page)
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);

  // Plans Token Input State
  const [planToken, setPlanToken] = useState('');
  const [tokenResult, setTokenResult] = useState<{ success: boolean; message: string } | null>(null);

  // Genre filtered view of Quick search grid
  const [genreFilter, setGenreFilter] = useState<string | null>(null);

  // Advanced Search & Filter states
  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
  const [advKeyword, setAdvKeyword] = useState('');
  const [advGenre, setAdvGenre] = useState('Todos');
  const [advYear, setAdvYear] = useState('Todos');
  const [advAgeRating, setAdvAgeRating] = useState('Todos');
  const [advPopularity, setAdvPopularity] = useState('Todos');

  // Admin CRUD states
  const [adminTab, setAdminTab] = useState<'requests' | 'catalog' | 'add' | 'edit'>('catalog');
  const [editFilmId, setEditFilmId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<'Filme' | 'Série' | 'Anime' | 'Dorama'>('Filme');
  const [formRating, setFormRating] = useState(4.5);
  const [formYear, setFormYear] = useState(2026);
  const [formGenres, setFormGenres] = useState('Ficção Científica, Drama');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formCoverMobile, setFormCoverMobile] = useState('');
  const [formCoverDesktop, setFormCoverDesktop] = useState('');
  const [formBackgroundMobile, setFormBackgroundMobile] = useState('');
  const [formBackgroundDesktop, setFormBackgroundDesktop] = useState('');
  const [formAgeRating, setFormAgeRating] = useState('14+');
  const [formSeasonsJson, setFormSeasonsJson] = useState('[]');

  // Featured Banner movie carousel selector index
  const [featuredHeroIndex, setFeaturedHeroIndex] = useState(0);
  
  // Custom Reviews for pricing page as listed in planos.png
  const customerReviews = [
    { name: 'Maria Silva', rating: 5, comment: 'A melhor plataforma de streaming que já usei! Qualidade incrível e catálogo diversificado.', avatar: 'https://picsum.photos/seed/user_maria/100/100' },
    { name: 'João Santos', rating: 5, comment: 'Assino o plano Premium e vale cada centavo. Os animes e doramas salvam meu fim de semana!', avatar: 'https://picsum.photos/seed/user_joao/100/100' },
    { name: 'Ana Costa', rating: 5, comment: 'Interface linda e fácil de usar. Minha família toda adora! Suporte respondeu em 2 minutos.', avatar: 'https://picsum.photos/seed/user_ana/100/100' },
    { name: 'Pedro Oliveira', rating: 4, comment: 'Os doramas e animes são atualizados rapidamente. Recomendo demais a todos!', avatar: 'https://picsum.photos/seed/user_pedro/100/100' },
    { name: 'Carla Mendes', rating: 5, comment: 'Suporte excelente e qualidade 4K perfeita. Não troco por nada!', avatar: 'https://picsum.photos/seed/user_carla/100/100' },
  ];

  // List of showcase slideshow titles representing "Noite Eterna", "Amor de Verão em Seul" and "Shinobi no Kaze"
  const featuredBanners = films.filter(f => ['noite-eterna', 'amor-de-verao-seul', 'shinobi-no-kaze'].includes(f.id));

  // Reset states on component selections
  useEffect(() => {
    if (selectedContent) {
      setCritiqueText('');
      setCritiqueError('');
      setCritiqueSuccess(false);
      setSelectedSeasonNumber(1);
      setShowChatPanel(false);
    }
  }, [selectedContent]);

  // Helper to determine age rating if not present
  const getAgeRating = (item: any): string => {
    if (item.ageRating) return item.ageRating;
    const g = item.genres || [];
    if (g.some((genre: string) => ['Terror', 'Suspense', 'Horror', 'Thriller'].includes(genre))) return '16+';
    if (g.some((genre: string) => ['Ação', 'Ficção Científica', 'Guerra'].includes(genre))) return '14+';
    if (item.category === 'Anime' || item.category === 'Dorama') return '12+';
    return 'Livre';
  };

  // Get filtered items including advanced Search & Filters
  const getAdvancedFilteredItems = () => {
    let list = allContent;
    
    // If we are on a specific category view, pre-filter by that:
    if (activeView === 'films') {
      list = films;
    } else if (activeView === 'series') {
      list = series;
    } else if (activeView === 'animes') {
      list = allContent.filter(item => (item.category as string) === 'Anime' || item.genres.includes('Animes') || (item.category as string) === 'Anime');
    } else if (activeView === 'doramas') {
      list = allContent.filter(item => (item.category as string) === 'Dorama' || item.genres.includes('Doramas') || (item.category as string) === 'Dorama');
    }

    // Apply genre Filter
    if (advGenre !== 'Todos') {
      list = list.filter(item => item.genres.includes(advGenre));
    }

    // Apply year filter
    if (advYear !== 'Todos') {
      if (advYear === 'Anos 2020s') {
        list = list.filter(item => item.year >= 2020);
      } else if (advYear === 'Anos 2010s') {
        list = list.filter(item => item.year >= 2010 && item.year < 2020);
      } else if (advYear === 'Antigos') {
        list = list.filter(item => item.year < 2010);
      } else {
        list = list.filter(item => item.year === parseInt(advYear));
      }
    }

    // Apply age rating filter
    if (advAgeRating !== 'Todos') {
      list = list.filter(item => getAgeRating(item) === advAgeRating);
    }

    // Apply popularity/rating filter
    if (advPopularity !== 'Todos') {
      if (advPopularity === 'Alta (★ 4.5+)') {
        list = list.filter(item => item.rating >= 4.5);
      } else if (advPopularity === 'Boa (★ 4.0+)') {
        list = list.filter(item => item.rating >= 4.0);
      } else if (advPopularity === 'Mais Popular (Relevantes)') {
        list = [...list].sort((a, b) => b.rating - a.rating);
      }
    }

    // Apply keyword text search
    if (advKeyword.trim()) {
      const q = advKeyword.toLowerCase();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.genres.some((g: string) => g.toLowerCase().includes(q))
      );
    }

    return list;
  };

  // Autocomplete Suggestions
  const autocompleteSuggestions = advKeyword.trim()
    ? allContent.filter(item => 
        item.title.toLowerCase().includes(advKeyword.toLowerCase())
      ).slice(0, 6)
    : [];

  // Personalized Recommendation Engine
  const getPersonalizedRecommendations = () => {
    if (!currentUser) {
      return allContent.filter(item => item.rating >= 4.5).slice(0, 10).map(item => ({ item, reason: 'Em Alta' }));
    }
    
    const watchedIds = new Set(watchHistory.map(h => h.contentId));
    const genreHits: Record<string, number> = {};
    
    watchHistory.forEach(item => {
      const origItem = allContent.find(c => c.id === item.contentId);
      if (origItem) {
        origItem.genres.forEach((g: string) => {
          genreHits[g] = (genreHits[g] || 0) + 1;
        });
      }
    });

    if (Object.keys(genreHits).length === 0) {
      // Return beautiful trending starter pack if no watch history
      return allContent.filter(item => item.rating >= 4.4).slice(0, 10).map(item => ({ item, reason: 'Lançamento em Alta' }));
    }

    // Sort genres based on watch frequency
    const sortedGenres = Object.entries(genreHits)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    const scoredList = allContent
      .filter(item => !watchedIds.has(item.id))
      .map(item => {
        const overlapCount = item.genres.filter((g: string) => sortedGenres.includes(g)).length;
        const score = (overlapCount * 2) + item.rating;
        let suggestionReason = 'Sugerido para você';
        if (overlapCount > 0) {
          const topOverlapGenre = item.genres.find((g: string) => sortedGenres.slice(0, 2).includes(g));
          if (topOverlapGenre) {
            suggestionReason = `Por gostar de ${topOverlapGenre}`;
          }
        }
        return { item, score, reason: suggestionReason };
      })
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoredList.length === 0) {
      return allContent.filter(item => item.rating >= 4.0).slice(0, 10).map(item => ({ item, reason: 'Em Alta na Semana' }));
    }

    return scoredList.slice(0, 10);
  };

  // CRUD Save helper
  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Por favor, preencha o título e a descrição!');
      return;
    }

    const compiledGenres = formGenres.split(',').map(g => g.trim()).filter(Boolean);
    
    let parsedSeasons = undefined;
    if (formCategory !== 'Filme') {
      try {
        parsedSeasons = formSeasonsJson ? JSON.parse(formSeasonsJson) : [];
      } catch (err) {
        alert('Erro ao processar as temporadas: Certifique-se de que o campo de temporadas é um JSON válido!');
        return;
      }
    }

    const payload = {
      title: formTitle,
      description: formDescription,
      category: formCategory,
      rating: Number(formRating),
      year: Number(formYear),
      genres: compiledGenres,
      videoUrl: formCategory === 'Filme' ? formVideoUrl : undefined,
      coverMobile: formCoverMobile,
      coverDesktop: formCoverDesktop,
      backgroundMobile: formBackgroundMobile,
      backgroundDesktop: formBackgroundDesktop,
      ageRating: formAgeRating,
      uploadDate: new Date().toISOString(),
      seasons: parsedSeasons
    };

    if (adminTab === 'edit' && editFilmId) {
      updateContent(editFilmId, payload);
      alert('Conteúdo atualizado com sucesso no catálogo!');
    } else {
      addContent(payload);
      alert('Novo conteúdo adicionado com sucesso ao catálogo!');
    }

    setAdminTab('catalog');
  };

  // Populates CRUD forms
  const handleEditClick = (item: any) => {
    setEditFilmId(item.id);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormCategory(item.category);
    setFormRating(item.rating);
    setFormYear(item.year);
    setFormGenres(item.genres.join(', '));
    setFormVideoUrl(item.videoUrl || '');
    setFormCoverMobile(item.coverMobile);
    setFormCoverDesktop(item.coverDesktop);
    setFormBackgroundMobile(item.backgroundMobile);
    setFormBackgroundDesktop(item.backgroundDesktop);
    setFormAgeRating(item.ageRating || getAgeRating(item));
    setFormSeasonsJson(item.seasons ? JSON.stringify(item.seasons, null, 2) : '[]');
    setAdminTab('edit');
  };

  const handleStartAddClick = () => {
    setEditFilmId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Filme');
    setFormRating(4.5);
    setFormYear(2026);
    setFormGenres('Ação, Aventura');
    setFormVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
    setFormCoverMobile('https://picsum.photos/seed/kunda_c/600/900');
    setFormCoverDesktop('https://picsum.photos/seed/kunda_d/1080/720');
    setFormBackgroundMobile('https://picsum.photos/seed/kunda_bgm/600/400');
    setFormBackgroundDesktop('https://picsum.photos/seed/kunda_bg/1920/1080');
    setFormAgeRating('14+');
    setFormSeasonsJson(`[\n  {\n    "number": 1,\n    "name": "Temporada 1",\n    "episodes": [\n      {\n        "number": 1,\n        "title": "Episódio Piloto",\n        "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",\n        "duration": "24 min"\n      },\n      {\n        "number": 2,\n        "title": "A Jornada Começa",\n        "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",\n        "duration": "22 min"\n      }\n    ]\n  }\n]`);
    setAdminTab('catalog'); // Select Tab
    setAdminTab('add');
  };

  const handleDeleteClick = (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir "${title}" do site? Esta ação é permanente.`)) {
      deleteContent(id);
      alert(`"${title}" excluído do site.`);
    }
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingName.trim()) return;

    addContentRequest(missingName, missingType);
    setMissingName('');
    setMissingSuccess(true);
    setTimeout(() => {
      setMissingSuccess(false);
    }, 4000);
  };

  const handlePostCritique = async (e: React.FormEvent) => {
    e.preventDefault();
    setCritiqueError('');
    setCritiqueSuccess(false);

    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!critiqueText.trim()) {
      setCritiqueError('Sua crítica não pode estar vazia.');
      return;
    }

    if (!selectedContent) return;

    const result = await addVIPComment(selectedContent.id, critiqueText, critiqueRating);
    if (result.success) {
      setCritiqueText('');
      setCritiqueSuccess(true);
      setTimeout(() => setCritiqueSuccess(false), 3000);
    } else if (result.error) {
      setCritiqueError(result.error);
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!chatMessageText.trim()) return;

    addGlobalChatMessage(chatMessageText);
    setChatMessageText('');

    // Scroll chat window to bottom
    setTimeout(() => {
      const feed = document.getElementById('chat-scroll-feed');
      if (feed) {
        feed.scrollTop = feed.scrollHeight;
      }
    }, 100);
  };

  const handleActivateTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenResult(null);
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!planToken.trim()) return;

    const res = await activateToken(planToken);
    setTokenResult(res);
    setPlanToken('');
  };

  // Quick helper to simulate a Kirvano token based on active dates to allow effortless evaluation!
  const handleGenerateSampleToken = (planId: number) => {
    const month = new Date().getMonth() + 1; // current month
    const yearLast = String(new Date().getFullYear()).slice(-1); // last digit
    const generated = `K0${month}${yearLast}${planId}`;
    setPlanToken(generated);
    setTokenResult({
      success: true,
      message: `Token gerado com sucesso para fins de teste: ${generated}. Clique em "Ativar Plano" para simular a validação instantânea!`
    });
  };

  // Filter lists based on selected view tags
  const getFilteredItems = () => {
    let list = allContent;
    if (activeView === 'films') {
      list = films;
    } else if (activeView === 'series') {
      list = series;
    } else if (activeView === 'animes') {
      list = allContent.filter(item => (item.category as string) === 'Anime' || item.genres.includes('Animes'));
    } else if (activeView === 'doramas') {
      list = allContent.filter(item => (item.category as string) === 'Dorama' || item.genres.includes('Doramas'));
    }

    if (genreFilter) {
      list = list.filter(item => item.genres.includes(genreFilter));
    }

    return list;
  };

  const currentHeroShowcase = featuredBanners[featuredHeroIndex] || films[0];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden font-sans bg-[#101010]" id="kundacine-root-container">
      
      {/* 1. Universal Blurry / Blurred Scroll bar Header */}
      <Header onOpenLoginModal={() => setIsLoginModalOpen(true)} />

      {/* Floating widgets */}
      <SupportWidget />
      <TrialCountdownBar />

      {/* Login signup overlay modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Immersive Transmission Player */}
      <VideoPlayerModal />

      {/* Main viewport Container with padding-top offset for fixed navbar */}
      <main className="flex-1 pb-16 pt-20">
        
        {/* VIEW A: SHOW STREAMING HUB LAYOUT (HOME OR CATEGORY FILTERS) */}
        {!selectedContent && ['home', 'films', 'series', 'animes', 'doramas'].includes(activeView) && (
          <div className="animate-fade-in space-y-12">
            
            {/* HERO CAROUSEL BANNER SECTION */}
            {activeView === 'home' && !genreFilter && currentHeroShowcase && (
              <section id="hero-slider" className="relative w-full h-[65vh] sm:h-[80vh] bg-black overflow-hidden flex items-end">
                {/* Visual Backdrop image for desktop and mobile */}
                <div className="absolute inset-0">
                  <picture>
                    <source media="(max-width: 640px)" srcSet={currentHeroShowcase.backgroundMobile} />
                    <img 
                      src={currentHeroShowcase.backgroundDesktop} 
                      alt={currentHeroShowcase.title}
                      className="w-full h-full object-cover opacity-65 transform scale-102 transition-transform duration-1000"
                    />
                  </picture>
                  {/* Cinematic black gradients shadows */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/30 to-black/60" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#101010]/95 via-transparent to-transparent hidden md:block" />
                </div>

                {/* Hero specifications contents */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 w-full z-10">
                  <div className="max-w-2xl space-y-4">
                    {/* Stars and meta tag indicator */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-[#101010]/85 border border-amber-500/30 px-2 py-0.5 rounded text-xs text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                        <span>★ {currentHeroShowcase.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-gray-300 font-bold font-mono">{currentHeroShowcase.year}</span>
                      <span className="text-[10px] text-white/90 font-black uppercase tracking-wider bg-[#f65c41] px-2 py-0.5 rounded">
                        Destaque do Mês
                      </span>
                    </div>

                    {/* Highly aesthetic paired Heading */}
                    <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white drop-shadow-md text-glow">
                      {currentHeroShowcase.title}
                    </h1>

                    {/* Genre badges in hero */}
                    <div className="flex flex-wrap gap-2">
                      {currentHeroShowcase.genres.map((g, i) => (
                        <span key={i} className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full font-semibold border border-white/5 text-gray-200">
                          {g}
                        </span>
                      ))}
                    </div>

                    {/* Description plots */}
                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl line-clamp-3">
                      {currentHeroShowcase.description}
                    </p>

                    {/* CTA Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        id="hero-play-button"
                        onClick={() => setSelectedContent(currentHeroShowcase)}
                        className="bg-[#f65c41] hover:bg-[#ff6c54] text-white px-6 py-3 rounded-full text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(246,92,65,0.4)] hover:scale-103"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Assistir Agora
                      </button>
                      <button
                        onClick={() => setSelectedContent(currentHeroShowcase)}
                        className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-3 rounded-full text-xs font-bold transition-all cursor-pointer"
                      >
                        Mais informações
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hero pagination/slideshow carousel bullets as shown in designdosite.png */}
                <div className="absolute right-6 bottom-16 sm:right-12 z-20 flex items-center gap-2">
                  {featuredBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setFeaturedHeroIndex(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        featuredHeroIndex === index ? 'w-8 bg-[#f65c41]' : 'w-2.5 bg-gray-500 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* INTERACTIVE ADVANCED SEARCH & FILTER PANEL */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#131313] border border-white/5 rounded-3xl p-5 sm:p-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Search className="w-4 h-4 text-[#f65c41]" />
                      Busca Avançada & Filtros de Títulos
                    </h3>
                    <p className="text-xs text-gray-400">
                      Filtre instantaneamente por gênero, ano de lançamento, classificação etária e popularidade.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsAdvSearchOpen(!isAdvSearchOpen);
                      // Clear search state on toggle
                      setAdvKeyword('');
                      setAdvGenre('Todos');
                      setAdvYear('Todos');
                      setAdvAgeRating('Todos');
                      setAdvPopularity('Todos');
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow ${
                      isAdvSearchOpen 
                        ? 'bg-[#f65c41] text-white hover:bg-[#ff6c54]' 
                        : 'bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    <ListFilter className="w-4 h-4" />
                    {isAdvSearchOpen ? 'Fechar Filtros Inteligentes' : 'Abrir Filtro Avançado'}
                  </button>
                </div>

                {isAdvSearchOpen && (
                  <div className="mt-5 pt-5 border-t border-white/5 space-y-5 animate-fade-in text-left">
                    {/* Real-time autocomplete text input */}
                    <div className="relative">
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                        Pesquisa com Autocomplete em tempo real
                      </label>
                      <div className="relative flex items-center">
                        <Search className="absolute left-3.5 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Digite o título, gênero ou palavras-chave desejadas..."
                          value={advKeyword}
                          onChange={(e) => setAdvKeyword(e.target.value)}
                          className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 transition-all shadow-inner"
                        />
                        {advKeyword && (
                          <button
                            onClick={() => setAdvKeyword('')}
                            className="absolute right-3 bg-white/5 hover:bg-white/10 text-gray-400 p-1.5 rounded-lg text-[9px] font-mono transition-colors"
                          >
                            Limpar
                          </button>
                        )}
                      </div>

                      {/* Floating Autocomplete Suggestions Dropdown box (as requested) */}
                      {autocompleteSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1.5 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-50 divide-y divide-white/5 max-h-[220px] overflow-y-auto animate-fade-in">
                          {autocompleteSuggestions.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedContent(item);
                                setAdvKeyword(''); // reset autocomplete on click
                              }}
                              className="p-3 hover:bg-[#202020] cursor-pointer flex items-center justify-between gap-3 text-left transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.coverMobile}
                                  alt={item.title}
                                  className="w-8 h-11 object-cover rounded-md"
                                />
                                <div>
                                  <h4 className="text-xs font-black text-white">{item.title}</h4>
                                  <span className="text-[9px] text-[#f65c41] font-extrabold uppercase">{item.category}</span>
                                </div>
                              </div>
                              <div className="text-[10px] font-mono text-gray-500 font-medium flex items-center gap-2">
                                <span>{item.year}</span>
                                <span>★ {item.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Filter row controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Genre Selector */}
                      <div>
                        <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                          Gênero
                        </label>
                        <select
                          value={advGenre}
                          onChange={(e) => setAdvGenre(e.target.value)}
                          className="w-full bg-[#181818] border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#f65c41]/50 cursor-pointer font-bold"
                        >
                          <option value="Todos">Todos os Gêneros</option>
                          <option value="Ficção Científica">Ficção Científica</option>
                          <option value="Drama">Drama</option>
                          <option value="Ação">Ação</option>
                          <option value="Terror">Terror</option>
                          <option value="Aventura">Aventura</option>
                          <option value="Fantasia">Fantasia</option>
                          <option value="Romance">Romance</option>
                          <option value="Suspense">Suspense</option>
                          <option value="Comédia">Comédia</option>
                          <option value="Animes">Animes</option>
                          <option value="Doramas">Doramas</option>
                        </select>
                      </div>

                      {/* Release Year Selector */}
                      <div>
                        <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                          Ano de Lançamento
                        </label>
                        <select
                          value={advYear}
                          onChange={(e) => setAdvYear(e.target.value)}
                          className="w-full bg-[#181818] border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#f65c41]/50 cursor-pointer font-bold"
                        >
                          <option value="Todos">Todos os Anos</option>
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                          <option value="Anos 2020s">Anos 2020s</option>
                          <option value="Anos 2010s">Anos 2010s</option>
                          <option value="Antigos">Clássicos (Anos 2000s/Anteriores)</option>
                        </select>
                      </div>

                      {/* Age Rating Selector */}
                      <div>
                        <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                          Classificação Etária
                        </label>
                        <select
                          value={advAgeRating}
                          onChange={(e) => setAdvAgeRating(e.target.value)}
                          className="w-full bg-[#181818] border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#f65c41]/50 cursor-pointer font-bold"
                        >
                          <option value="Todos">Todas as Classificações</option>
                          <option value="Livre">Livre</option>
                          <option value="12+">12+</option>
                          <option value="14+">14+</option>
                          <option value="16+">16+</option>
                          <option value="18+">18+</option>
                        </select>
                      </div>

                      {/* Popularity/Rating Selector */}
                      <div>
                        <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                          Popularidade & Avaliações
                        </label>
                        <select
                          value={advPopularity}
                          onChange={(e) => setAdvPopularity(e.target.value)}
                          className="w-full bg-[#181818] border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#f65c41]/50 cursor-pointer font-bold"
                        >
                          <option value="Todos">Padrão Kundacine</option>
                          <option value="Alta (★ 4.5+)">Excelência (★ 4.5+)</option>
                          <option value="Boa (★ 4.0+)">Bem Avaliados (★ 4.0+)</option>
                          <option value="Mais Popular (Relevantes)">Mais Popular (Relevantes)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-2 border-t border-white/5">
                      <span>Resultados em tempo real: <strong className="text-white">{getAdvancedFilteredItems().length} títulos</strong> correspondentes.</span>
                      {(advKeyword || advGenre !== 'Todos' || advYear !== 'Todos' || advAgeRating !== 'Todos' || advPopularity !== 'Todos') && (
                        <button
                          onClick={() => {
                            setAdvKeyword('');
                            setAdvGenre('Todos');
                            setAdvYear('Todos');
                            setAdvAgeRating('Todos');
                            setAdvPopularity('Todos');
                          }}
                          className="text-[#f65c41] hover:underline cursor-pointer font-bold transition-all"
                        >
                          Limpar Todos os Filtros
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ADVANCED FILTERED RESULTS GRID */}
            {isAdvSearchOpen && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 bg-[#f65c41] rounded-full inline-block animate-pulse" />
                  <h3 className="text-lg font-display font-black tracking-tight text-white flex items-center gap-1.5">
                    🔍 Resultados da Filtragem Avançada ({getAdvancedFilteredItems().length})
                  </h3>
                </div>

                {getAdvancedFilteredItems().length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {getAdvancedFilteredItems().map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedContent(item)}
                        className="group relative bg-[#131313] border border-white/5 rounded-2xl overflow-hidden hover:border-[#f65c41]/30 cursor-pointer shadow-md hover:shadow-[0_8px_24px_rgba(246,92,65,0.15)] transition-all flex flex-col hover:-translate-y-1 duration-300"
                      >
                        <div className="relative aspect-[3/4.5] bg-zinc-900 overflow-hidden shrink-0">
                          <img
                            src={item.coverMobile}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-[#101010]/80 border border-white/10 px-2 py-0.5 rounded text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5">
                            <span>★ {item.rating.toFixed(1)}</span>
                          </div>
                          <div className="absolute top-2.5 right-2.5 bg-black/60 px-2 py-0.5 rounded text-[9px] text-[#f65c41] font-mono leading-none font-black border border-white/10">
                            {getAgeRating(item)}
                          </div>
                        </div>
                        <div className="p-3 bg-[#131313]/90 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#f65c41]">{item.category}</span>
                            <h4 className="text-xs font-black text-gray-100 group-hover:text-[#f65c41] transition-colors mt-0.5 truncate">{item.title}</h4>
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold mt-2 pt-1 border-t border-white/5">
                            <span>{item.year}</span>
                            <span>1080p | 4K</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center bg-[#131313] border border-white/5 p-12 rounded-3xl max-w-md mx-auto">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white">Nenhum título correspondente encontrado</p>
                    <p className="text-xs text-gray-400 mt-2">Altere os filtros acima para encontrar títulos ideais!</p>
                  </div>
                )}
              </section>
            )}

            {/* PERSONALIZED RECOMMENDATION GRID - "Para Você" */}
            {activeView === 'home' && !genreFilter && !isAdvSearchOpen && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#f65c41] rounded-full inline-block animate-pulse" />
                    <h3 className="text-lg font-display font-black tracking-tight text-white flex items-center gap-1.5">
                      ✨ Recomendado Para Você
                    </h3>
                  </div>
                  {currentUser ? (
                    <span className="text-[10px] bg-[#f65c41]/10 text-[#f65c41] border border-[#f65c41]/20 px-2.5 py-0.5 rounded-full font-bold">
                      Personalizado para @{currentUser.nickname}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500">Faça login para calibrar as recomendações</span>
                  )}
                </div>

                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-x-visible sm:pb-0 sm:snap-none overflow-y-visible py-3 -my-3">
                  {getPersonalizedRecommendations().map((entry: any) => {
                    const item = entry.item || entry;
                    const reason = entry.reason || 'Recomendado';
                    return (
                      <motion.div
                        key={item.id}
                        onClick={() => setSelectedContent(item)}
                        whileHover={{ scale: 1.05, y: -6, zIndex: 30 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="group relative bg-[#131313] border border-white/5 rounded-2xl overflow-hidden hover:border-[#f65c41]/30 cursor-pointer shadow-md hover:shadow-[0_12px_36px_rgba(246,92,65,0.25)] flex flex-col w-[170px] xs:w-[200px] sm:w-auto shrink-0 snap-start"
                      >
                        <div className="relative aspect-[3/4.5] bg-zinc-900 overflow-hidden shrink-0">
                          <img
                            src={item.coverMobile}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-[#101010]/80 border border-white/10 px-2 py-0.5 rounded text-[10px] text-amber-500 font-extrabold flex items-center gap-0.5">
                            <span>★ {item.rating.toFixed(1)}</span>
                          </div>
                          
                          {/* Reason badge for Recommendation */}
                          <div className="absolute bottom-2.5 left-2.5 bg-[#f65c41] px-2 py-0.5 rounded text-[9px] text-white font-extrabold shadow border border-[#f65c41]/40 max-w-[90%] truncate">
                            {reason}
                          </div>
                        </div>
                        <div className="p-3 bg-[#131313]/90 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#f65c41]">{item.category}</span>
                            <h4 className="text-xs font-black text-gray-100 group-hover:text-[#f65c41] transition-colors mt-0.5 truncate">{item.title}</h4>
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold mt-2 pt-1 border-t border-white/5">
                            <span>{item.year}</span>
                            <span>{getAgeRating(item)}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Hub Title if filtered or specific category */}
            {(activeView !== 'home' || genreFilter) && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-3xl font-display font-black tracking-tight text-white capitalize">
                      {genreFilter ? `Gênero: ${genreFilter}` : activeView === 'films' ? 'Filmes Completos' : activeView === 'series' ? 'Séries em Destaque' : activeView === 'animes' ? 'Catálogo Animes' : 'Doramas Orientais'}
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">Conectado via servidores ultra-velozes Kundacine CDN.</p>
                  </div>

                  {genreFilter && (
                    <button
                      onClick={() => setGenreFilter(null)}
                      className="bg-white/5 text-gray-300 hover:text-white px-4 py-1.5 rounded-full text-xs font-semibold border border-white/5 cursor-pointer self-start transition-colors"
                    >
                      Limpar filtro de gênero
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* CONTINUE ASSISTINDO SECTION - Only visible for users with progressive watch logs */}
            {activeView === 'home' && !genreFilter && watchHistory.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="continue-watching-section">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#f65c41] rounded-full inline-block" />
                    <h3 className="text-lg font-display font-black tracking-tight text-white">Continue Assistindo</h3>
                  </div>
                  <button
                    onClick={clearWatchHistory}
                    className="text-gray-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                    title="Limpar Histórico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar Estante
                  </button>
                </div>

                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-x-visible sm:pb-0 sm:snap-none overflow-y-visible py-3 -my-3">
                  {watchHistory.slice(0, 5).map((historyItem) => {
                    // find original object details
                    const orig = allContent.find(c => c.id === historyItem.contentId);
                    return (
                      <motion.div
                        key={historyItem.id}
                        whileHover={{ scale: 1.05, y: -6, zIndex: 30 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="group relative bg-[#161616] border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_12px_36px_rgba(246,92,65,0.25)] flex flex-col w-[170px] xs:w-[200px] sm:w-auto shrink-0 snap-start"
                      >
                        <div className="relative aspect-[3/4.5] overflow-hidden bg-zinc-900 flex-1">
                          <img
                            src={historyItem.cover}
                            alt={historyItem.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2.5">
                            {/* Play overlay button */}
                            <button
                              onClick={() => {
                                if (orig) {
                                  setSelectedContent(orig);
                                  if (historyItem.seasonNumber) {
                                    // Set playing episode straightaway
                                    setPlayingEpisode({
                                      videoUrl: historyItem.videoUrl,
                                      content: orig,
                                      seasonNumber: historyItem.seasonNumber,
                                      episodeNumber: historyItem.episodeNumber,
                                      episodeTitle: historyItem.episodeTitle
                                    });
                                  } else {
                                    setPlayingEpisode({
                                      videoUrl: historyItem.videoUrl,
                                      content: orig
                                    });
                                  }
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-[#f65c41] hover:bg-[#ff6c54] hover:scale-105 transition-all flex items-center justify-center text-white cursor-pointer mx-auto shadow"
                            >
                              <Play className="w-4.5 h-4.5 fill-white ml-0.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title and Progress Bar log */}
                        <div className="p-3 bg-[#131313]/90 space-y-1">
                          <h4 className="text-xs font-extrabold text-white truncate">{historyItem.title}</h4>
                          {historyItem.episodeNumber && (
                            <p className="text-[9px] text-[#f65c41] font-semibold">T{historyItem.seasonNumber}Ep{historyItem.episodeNumber}</p>
                          )}
                          <div className="space-y-1 pt-1">
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-[#f65c41]"
                                style={{ width: `${historyItem.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[8px] text-gray-400">
                              <span>Progresso: {historyItem.progress}%</span>
                              <span>Pausado</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* NOVIDADES ROW SECTION */}
            {activeView === 'home' && !genreFilter && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 bg-[#f65c41] rounded-full inline-block" />
                  <h3 className="text-lg font-display font-black tracking-tight text-white flex items-center gap-1.5">
                    🆕 Novidades no Catálogo
                  </h3>
                </div>

                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-x-visible sm:pb-0 sm:snap-none overflow-y-visible py-3 -my-3">
                  {films.slice(0, 5).map((item) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setSelectedContent(item)}
                      whileHover={{ scale: 1.05, y: -6, zIndex: 30 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="group relative bg-[#131313] border border-white/5 rounded-2xl overflow-hidden hover:border-[#f65c41]/30 cursor-pointer shadow-md hover:shadow-[0_12px_36px_rgba(246,92,65,0.25)] flex flex-col w-[170px] xs:w-[200px] sm:w-auto shrink-0 snap-start"
                    >
                      <div className="relative aspect-[3/4.5] bg-zinc-900 overflow-hidden shrink-0">
                        <img
                          src={item.coverMobile}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-[#101010]/80 border border-white/10 px-2 py-0.5 rounded text-[10px] text-[#f65c41] font-extrabold flex items-center gap-0.5">
                          <span>★ {item.rating.toFixed(1)}</span>
                        </div>
                        {/* Interactive overlay card */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 duration-300">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-[#f65c41]">{item.category}</span>
                          <h4 className="text-xs font-black text-white mt-0.5 truncate">{item.title}</h4>
                          <span className="text-[10px] text-gray-400 font-bold mt-1">Clique para Detalhes</span>
                        </div>
                      </div>
                      <div className="p-3 bg-[#131313]/90 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-black text-gray-100 group-hover:text-[#f65c41] transition-colors truncate">{item.title}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold mt-2 pt-1 border-t border-white/5">
                          <span>{item.year}</span>
                          <span>1080p | 4K</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* INTERMEDIAL CONTENT REQUEST FORM AREA - Centered between Novidades & Mais Buscados */}
            {activeView === 'home' && !genreFilter && (
              <section id="content-request-area" className="w-full bg-[#161616] border-y border-white/5 py-8 sm:py-12 my-6">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                  <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white">
                    Não encontrou o que queria assistir? 🍿
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto">
                    Digite o nome de qualquer filme, série, anime ou dorama abaixo. Nossa equipe adicionará o arquivo em alta definição no site em <strong className="text-[#f65c41]">até 1 hora</strong>!
                  </p>

                  <form onSubmit={handleCreateRequest} className="max-w-lg mx-auto flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
                    <input
                      type="text"
                      placeholder="Nome do título desejado..."
                      value={missingName}
                      onChange={(e) => setMissingName(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 px-4 text-xs text-white placeholder-gray-500 transition-all"
                      required
                    />
                    
                    <select
                      value={missingType}
                      onChange={(e) => setMissingType(e.target.value)}
                      className="bg-zinc-800 border border-white/10 focus:border-[#f65c41]/50 text-white rounded-xl px-3 py-2 text-xs outline-none"
                    >
                      <option value="Filme">Filme</option>
                      <option value="Série">Série</option>
                      <option value="Anime">Anime</option>
                      <option value="Dorama">Dorama</option>
                    </select>

                    <button
                      type="submit"
                      className="bg-[#f65c41] hover:bg-[#ff6c54] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      Pedir Conteúdo
                    </button>
                  </form>

                  {missingSuccess && (
                    <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 max-w-sm mx-auto p-2 rounded-lg flex items-center justify-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                      <span>Pedido anotado! Adicionaremos em 1h. Verifique no Painel do Admin.</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* GENERAL GRID: DISPLAY FILTERED LIST (FOR BOTH FILMS, SERIES, SEARCH QUERY OR GENRES) */}
            {(activeView !== 'home' || genreFilter) && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 mb-6">
                  <ListFilter className="w-5 h-5 text-[#f65c41]" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Títulos Disponíveis ({getFilteredItems().length})</h3>
                </div>

                {getFilteredItems().length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {getFilteredItems().map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedContent(item)}
                        className="group relative bg-[#131313] border border-white/5 rounded-2xl overflow-hidden hover:border-[#f65c41]/30 cursor-pointer shadow-md hover:scale-102 transition-all flex flex-col"
                      >
                        <div className="relative aspect-[3/4.5] bg-zinc-900 overflow-hidden">
                          <img
                            src={item.coverMobile}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-[#101010]/85 border border-white/10 px-2 py-0.5 rounded text-[10px] text-amber-400 font-extrabold flex items-center gap-0.5">
                            <span>★ {item.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-[#131313]/90 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#f65c41]">{item.category}</span>
                            <h4 className="text-xs font-black text-gray-100 group-hover:text-[#f65c41] transition-color mt-0.5 truncate">{item.title}</h4>
                            <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold mt-3 pt-2 border-t border-white/5">
                            <span>{item.year}</span>
                            <span>{item.category === 'Série' ? `${item.seasons?.length} Temp` : 'Filme'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center bg-[#131313] border border-white/5 p-12 rounded-3xl max-w-md mx-auto">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white">Nenhum título encontrado</p>
                    <p className="text-xs text-gray-400 mt-2">Dica: Use o formulário de Pedidos acima para solicitar a inclusão da produção imediatamente.</p>
                  </div>
                )}
              </section>
            )}

            {/* MAIS BUSCADOS SECTION (POPULAR) */}
            {activeView === 'home' && !genreFilter && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 bg-[#f65c41] rounded-full inline-block" />
                  <h3 className="text-lg font-display font-black tracking-tight text-white flex items-center gap-1.5">
                    🔥 Mais Buscados da Semana
                  </h3>
                </div>

                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-x-visible sm:pb-0 sm:snap-none overflow-y-visible py-3 -my-3">
                  {/* Highlight items with score >= 4.5 */}
                  {allContent.filter(c => c.rating >= 4.5).slice(0, 5).map((item) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setSelectedContent(item)}
                      whileHover={{ scale: 1.05, y: -6, zIndex: 30 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="group relative bg-[#131313] border border-white/5 rounded-2xl overflow-hidden hover:border-[#f65c41]/30 cursor-pointer shadow hover:shadow-[0_12px_36px_rgba(246,92,65,0.25)] w-[220px] xs:w-[260px] sm:w-auto shrink-0 snap-start flex flex-col"
                    >
                      <img
                        src={item.coverDesktop}
                        alt={item.title}
                        className="w-full aspect-[4/3] object-cover shrink-0"
                      />
                      <div className="p-3 bg-[#131313]/95 text-left flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[8px] font-bold text-[#f65c41] uppercase tracking-wider">
                            <span>{item.category}</span>
                            <span className="text-amber-400">★ {item.rating}</span>
                          </div>
                          <h4 className="text-xs font-black text-gray-100 group-hover:text-[#f65c41] transition-color mt-0.5 truncate">{item.title}</h4>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.genres.slice(0, 2).map((g, i) => (
                            <span key={i} className="text-[8px] bg-white/5 px-2 py-0.2 rounded border border-white/5 text-gray-400">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* ANIMES EM DESTAQUE SECTION */}
            {activeView === 'home' && !genreFilter && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 bg-[#f65c41] rounded-full inline-block" />
                  <h3 className="text-lg font-display font-black tracking-tight text-white flex items-center gap-1.5">
                    🎌 Animes em Destaque
                  </h3>
                </div>

                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-x-visible sm:pb-0 sm:snap-none overflow-y-visible py-3 -my-3">
                  {allContent.filter(c => c.category === 'Anime').map((item) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setSelectedContent(item)}
                      whileHover={{ scale: 1.05, y: -6, zIndex: 30 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="group relative bg-[#131313] border border-white/5 rounded-2xl overflow-hidden hover:border-[#f65c41]/30 cursor-pointer shadow hover:shadow-[0_12px_36px_rgba(246,92,65,0.25)] flex flex-col w-[170px] xs:w-[200px] sm:w-auto shrink-0 snap-start"
                    >
                      <div className="relative aspect-[3/4.5] bg-zinc-900 overflow-hidden shrink-0">
                        <img
                          src={item.coverMobile}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-[#101010]/80 border border-white/10 px-2 py-0.5 rounded text-[10px] text-amber-400 font-extrabold flex items-center gap-0.5">
                          <span>★ {item.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-[#131313]/90 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-black text-gray-100 group-hover:text-[#f65c41] truncate transition-color">{item.title}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold mt-2 pt-1 border-t border-white/5">
                          <span>{item.year}</span>
                          <span>Legendado | Dublado</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* DORAMAS SECTION */}
            {activeView === 'home' && !genreFilter && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 bg-[#f65c41] rounded-full inline-block" />
                  <h3 className="text-lg font-display font-black tracking-tight text-white flex items-center gap-1.5">
                    🇰🇷 Doramas Coreanos Recomendados
                  </h3>
                </div>

                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-x-visible sm:pb-0 sm:snap-none overflow-y-visible py-3 -my-3">
                  {allContent.filter(c => c.category === 'Dorama').map((item) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setSelectedContent(item)}
                      whileHover={{ scale: 1.05, y: -6, zIndex: 30 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="group relative bg-[#131313] border border-white/5 rounded-2xl overflow-hidden hover:border-[#f65c41]/30 cursor-pointer shadow hover:shadow-[0_12px_36px_rgba(246,92,65,0.25)] flex flex-col w-[170px] xs:w-[200px] sm:w-auto shrink-0 snap-start"
                    >
                      <div className="relative aspect-[3/4.5] bg-zinc-900 overflow-hidden shrink-0">
                        <img
                          src={item.coverMobile}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-[#101010]/80 border border-white/10 px-2 py-0.5 rounded text-[10px] text-amber-400 font-extrabold flex items-center gap-0.5">
                          <span>★ {item.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-[#131313]/90 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-black text-gray-100 group-hover:text-[#f65c41] truncate transition-color">{item.title}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold mt-2 pt-1 border-t border-white/5">
                          <span>{item.year}</span>
                          <span>Completo Português</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* GENRE SEARCH SECTION */}
            {activeView === 'home' && !genreFilter && (
              <section id="genre-quick-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-6 bg-[#f65c41] rounded-full inline-block" />
                  <h3 className="text-lg font-display font-black tracking-tight text-white flex items-center gap-1.5">
                    ⚡ Busca de Gêneros Rápida
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { name: 'Ação', bg: 'https://picsum.photos/seed/genre_action/400/220', desc: 'Combates de tirar o fôlego' },
                    { name: 'Drama', bg: 'https://picsum.photos/seed/genre_drama/400/220', desc: 'Narrativas intensas e profundas' },
                    { name: 'Ficção Científica', bg: 'https://picsum.photos/seed/genre_scifi/400/220', desc: 'Mundos paralelos e futurismo' },
                    { name: 'Suspense', bg: 'https://picsum.photos/seed/genre_thriller/400/220', desc: 'Mistérios intrigantes' },
                    { name: 'Romance', bg: 'https://picsum.photos/seed/genre_romance/400/220', desc: 'Doutrinações apaixonantes' },
                    { name: 'Animes', bg: 'https://picsum.photos/seed/genre_anime/400/220', desc: 'Animações desenhadas' }
                  ].map((genre) => (
                    <button
                      key={genre.name}
                      onClick={() => setGenreFilter(genre.name)}
                      className="group relative h-28 border border-white/5 rounded-2xl overflow-hidden cursor-pointer text-left transition-all hover:scale-103 hover:border-[#f65c41]/35 shadow"
                    >
                      <img
                        src={genre.bg}
                        alt={genre.name}
                        className="w-full h-full object-cover opacity-35 group-hover:opacity-55 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-3 flex flex-col justify-end">
                        <span className="text-sm font-black text-white group-hover:text-[#f65c41] transition-colors">{genre.name}</span>
                        <span className="text-[8px] text-gray-400 font-semibold line-clamp-1 mt-0.5">{genre.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* VIEW B: INTEGRATED SHOW DETAIL SCREEN WITH SEASONS SELECTOR AND VIP COMMENTS + GLOBAL CHAT SIDES */}
        {selectedContent && (
          <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            
            {/* Back Nav Link */}
            <button
              onClick={() => setSelectedContent(null)}
              className="text-gray-400 hover:text-[#f65c41] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              Voltar ao Catálogo Principal
            </button>

            {/* Split Grid for Split Chat Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Content Panel */}
              <div className={`space-y-8 ${showChatPanel ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                
                {/* Immersive backdrop header */}
                <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 md:h-[420px] bg-black flex items-end">
                  <picture className="absolute inset-0">
                    <source media="(max-width: 640px)" srcSet={selectedContent.backgroundMobile} />
                    <img 
                      src={selectedContent.backgroundDesktop} 
                      alt={selectedContent.title}
                      className="w-full h-full object-cover opacity-60"
                    />
                  </picture>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/10 to-transparent" />
                  
                  {/* Detailed Specs tag bar overlay on banner */}
                  <div className="relative p-6 sm:p-10 w-full space-y-3 z-10">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded font-black">
                        <Star className="w-3 h-3 fill-black shrink-0" />
                        <span>★ {selectedContent.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-300 font-bold font-mono">{selectedContent.year}</span>
                      <span className="text-white bg-[#f65c41]/85 border border-[#f65c41] px-2.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest leading-none">
                        Transmissão Disponível
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white text-glow">
                      {selectedContent.title}
                    </h1>

                    <div className="flex flex-wrap gap-1.5">
                      {selectedContent.genres.map((g, i) => (
                        <span key={i} className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full font-bold border border-white/5 text-gray-300">
                          {g}
                        </span>
                      ))}
                    </div>

                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                      {selectedContent.description}
                    </p>

                    {/* Stream controller bar */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      
                      {/* Movie play or Series play default (Episode 1) */}
                      {selectedContent.category === 'Filme' || selectedContent.category === 'Dorama' && !selectedContent.seasons ? (
                        <button
                          onClick={() => setPlayingEpisode({
                            videoUrl: selectedContent.videoUrl!,
                            content: selectedContent
                          })}
                          className="bg-[#f65c41] hover:bg-[#ff6c54] text-white py-3 px-6 rounded-full text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-[0_4px_16px_rgba(246,92,65,0.4)]"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          Assistir Agora
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const firstEp = selectedContent.seasons?.[0]?.episodes?.[0];
                            if (firstEp) {
                              setPlayingEpisode({
                                videoUrl: firstEp.videoUrl,
                                content: selectedContent,
                                seasonNumber: 1,
                                episodeNumber: 1,
                                episodeTitle: firstEp.title
                              });
                            }
                          }}
                          className="bg-[#f65c41] hover:bg-[#ff6c54] text-white py-3 px-6 rounded-full text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-[0_4px_16px_rgba(246,92,65,0.4)]"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          Assistir Episódio 1
                        </button>
                      )}

                      <button
                        onClick={() => setShowChatPanel(!showChatPanel)}
                        className={`py-3 px-5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                          showChatPanel 
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_4px_12px_rgba(251,191,36,0.3)]' 
                            : 'bg-white/5 text-white border-white/10 hover:bg-white/15'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        {showChatPanel ? 'Fechar Chat Global' : 'Abrir Chat Global'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SELECTION FOR SERIES SEASONS AND EPISODES */}
                {selectedContent.seasons && selectedContent.seasons.length > 0 && (
                  <div className="bg-[#131313] border border-white/5 p-6 rounded-3xl space-y-6" id="seasons-panel">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-lg font-display font-black tracking-tight text-white flex items-center gap-2">
                          <Tv className="w-5 h-5 text-[#f65c41]" />
                          Seletor de Temporadas e Episódios
                        </h3>
                        <p className="text-gray-400 text-xs mt-0.5">Selecione e reproduza na hora os episódios completos.</p>
                      </div>

                      {/* Season Selector Select Field */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-semibold">Temporada:</span>
                        <select
                          value={selectedSeasonNumber}
                          onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value))}
                          className="bg-zinc-800 border border-white/10 text-white rounded-xl py-1.5 px-3 text-xs outline-none focus:border-[#f65c41]"
                        >
                          {selectedContent.seasons.map((season) => (
                            <option key={season.number} value={season.number}>
                              Temporada {season.number}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Episodes list */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {selectedContent.seasons
                        .find(s => s.number === selectedSeasonNumber)
                        ?.episodes.map((ep) => (
                          <div
                            key={ep.number}
                            onClick={() => setPlayingEpisode({
                              videoUrl: ep.videoUrl,
                              content: selectedContent,
                              seasonNumber: selectedSeasonNumber,
                              episodeNumber: ep.number,
                              episodeTitle: ep.title
                            })}
                            className="bg-white/5 hover:bg-[#f65c41]/10 border border-white/5 hover:border-[#f65c41]/20 p-3.5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all hover:translate-x-1 group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-[#f65c41]/20 flex items-center justify-center text-xs font-mono font-bold text-gray-300 group-hover:text-[#f65c41] transition-colors">
                                Ep {ep.number}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white group-hover:text-[#f65c41] transition-all">{ep.title}</h4>
                                <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  Duração: {ep.duration}
                                </span>
                              </div>
                            </div>

                            <button className="bg-white/5 hover:bg-[#f65c41] text-gray-300 group-hover:text-white group-hover:scale-105 p-2 rounded-full transition-all">
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* CRITICAS DOS MEMBROS VIP (PREMIUM COMMENT SECTION) */}
                <div className="bg-[#131313] border border-white/5 p-6 rounded-3xl space-y-6" id="comments-panel">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-display font-black tracking-tight text-[#f65c41] flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      Críticas dos Membros VIP e Premium
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1">
                      A visualização é aberta a todos, porém a postagem de críticas é de uso <strong className="text-amber-400 uppercase tracking-widest">Exclusivo de Assinantes Premium</strong>.
                    </p>
                  </div>

                  {/* Comment Submission box */}
                  <form onSubmit={handlePostCritique} className="space-y-4">
                    {critiqueError && (
                      <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{critiqueError}</span>
                      </div>
                    )}

                    {critiqueSuccess && (
                      <div className="p-3 text-xs bg-[#f65c41]/10 border border-[#f65c41]/20 text-amber-500 rounded-xl flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Crítica VIP publicada com sucesso!</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Como você avalia essa produção? (Estrelas)
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setCritiqueRating(s)}
                            className="p-1 focus:outline-none transition-transform active:scale-90"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                s <= critiqueRating ? 'fill-amber-400 text-amber-400' : 'text-gray-600 hover:text-gray-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={3}
                        placeholder={
                          currentUser?.plan === 'Premium' 
                          ? "Compartilhe sua opinião técnica detalhada sobre esta obra de arte..." 
                          : "Apenas membros do plano PREMIUM podem comentar. Faça o upgrade agora no menu Planos!"
                        }
                        disabled={currentUser?.plan !== 'Premium'}
                        value={critiqueText}
                        onChange={(e) => setCritiqueText(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-2xl p-4 text-xs text-white placeholder-gray-500 transition-all resize-none"
                      />
                      
                      {currentUser?.plan !== 'Premium' && (
                        <div className="absolute inset-0 bg-[#101010]/75 rounded-2xl flex items-center justify-center p-4">
                          <button
                            type="button"
                            onClick={() => setView('plans')}
                            className="bg-amber-400 hover:bg-amber-500 text-black py-2 px-4 rounded-xl text-xs font-extrabold shadow flex items-center gap-1 transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Upgrade para Premium (Comentários Liberados)
                          </button>
                        </div>
                      )}
                    </div>

                    {currentUser?.plan === 'Premium' && (
                      <button
                        type="submit"
                        className="bg-[#f65c41] hover:bg-[#ff6c54] text-white py-2 px-5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Publicar Crítica VIP
                      </button>
                    )}
                  </form>

                  {/* List of comments posted on this piece of content */}
                  <div className="space-y-3.5 pt-4 border-t border-white/5">
                    {vipComments.filter(vc => vc.contentId === selectedContent.id).length > 0 ? (
                      vipComments
                        .filter(vc => vc.contentId === selectedContent.id)
                        .map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-[#181818] border border-white/5 p-4 rounded-2xl flex gap-3 text-sm animate-fade-in"
                          >
                            <img
                              src={comment.avatar}
                              alt={comment.userName}
                              className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-xs">{comment.userName}</span>
                                  <span className="text-[9px] text-gray-400 font-mono">@{comment.userNickname}</span>
                                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[8px] font-black tracking-tight px-1.5 rounded-full uppercase leading-4">
                                    {comment.userPlan === 'Premium' ? 'VIP MEMBER' : comment.userPlan}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-500">{new Date(comment.timestamp).toLocaleDateString('pt-BR')}</span>
                              </div>

                              {/* Star rating indicators inside comment */}
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, stIdx) => (
                                  <Star
                                    key={stIdx}
                                    className={`w-3 h-3 ${stIdx < comment.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}`}
                                  />
                                ))}
                              </div>

                              <p className="text-xs text-gray-300 leading-relaxed pt-1">
                                {comment.text}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center p-8 bg-white/5 rounded-2xl">
                        <p className="text-xs text-gray-400">Nenhuma crítica oficial foi postada de membros VIP ainda.</p>
                        <p className="text-[10px] text-gray-500 mt-1">Seja o primeiro! Se você é assinante Premium, sua opinião aparecerá aqui em destaque!</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* SPLIT CHAT PANEL (GLOBAL CHAT FOR ALL ACTIVE USERS LIKE TWITCH CHAT) */}
              {showChatPanel && (
                <div className="lg:col-span-4 bg-[#131313] border border-white/5 rounded-3xl h-[600px] flex flex-col overflow-hidden shadow-2xl z-20 animate-fade-in" id="global-chat-panel">
                  {/* Chat Panel Header */}
                  <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Bate-Papo Global Active
                      </h3>
                      <p className="text-[9px] text-gray-500">Todos os membros de bacia assistindo juntos.</p>
                    </div>
                    <button
                      onClick={() => setShowChatPanel(false)}
                      className="text-gray-400 hover:text-white p-1 rounded-full text-xs font-semibold"
                    >
                      Ocultar
                    </button>
                  </div>

                  {/* Mensagem scroll feed listing */}
                  <div id="chat-scroll-feed" className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0f0f0f]">
                    {globalChat.map((msg) => (
                      <div key={msg.id} className="text-xs space-y-1 animate-fade-in">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={msg.avatar}
                            alt={msg.userName}
                            className="w-5 h-5 rounded-full object-cover border border-white/10"
                          />
                          <span className="font-semibold text-gray-300 truncate max-w-[90px]" title={msg.userName}>
                            {msg.userName}
                          </span>
                          <span className="text-[8px] text-gray-500 font-mono">@{msg.userNickname}</span>
                          <span className={`text-[8px] px-1 rounded-full ${
                            msg.userPlan === 'Premium' ? 'bg-amber-400 text-black font-extrabold' : 'bg-zinc-800 text-gray-400'
                          }`}>
                            {msg.userPlan}
                          </span>
                        </div>
                        <p className="text-gray-200 pl-6.5 break-words font-sans">{msg.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Message submission field */}
                  <form onSubmit={handleSendChatMessage} className="p-3 bg-white/5 border-t border-white/5 flex gap-1.5">
                    <input
                      type="text"
                      placeholder={currentUser ? "Digite sua mensagem..." : "Conecte-se para participar no chat!"}
                      disabled={!currentUser}
                      value={chatMessageText}
                      onChange={(e) => setChatMessageText(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-1.5 px-3 text-xs text-white"
                    />
                    <button
                      type="submit"
                      disabled={!currentUser}
                      className="bg-[#f65c41] hover:bg-[#ff6c54] disabled:bg-zinc-800 p-2 rounded-xl text-white disabled:text-gray-600 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW C: DETAILED PRICING PLANS VIEW WITH AUTHENTICATION INTEGRATORS */}
        {activeView === 'plans' && (
          <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-16">
            
            {/* Header titles */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-[10px] bg-gradient-to-r from-amber-400 to-[#f65c41] text-black font-extrabold tracking-widest px-3 py-1 rounded-full uppercase">
                Planos Oficiais Kundacine
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white leading-tight">
                Escolha seu <span className="text-[#f65c41] text-glow">Plano ideal</span>
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                Assine agora e tenha acesso imediato e sem limites a todo o catálogo de filmes, séries, anime e doramas com liberação por token instantânea no seu e-mail de pagamento!
              </p>
            </div>

            {/* TESTIMONIALS / REVIEWS - logo acima dos planos como exigido */}
            <section id="plans-testimonials" className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#f65c41]">O que dizem os nossos assinantes</h3>
                <p className="text-sm font-semibold text-gray-300">Milhares de usuários satisfeitos assistindo hoje e avaliando com 5 estrelas</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {customerReviews.map((review, i) => (
                  <div
                    key={i}
                    className="bg-[#131313] border border-white/5 p-4 rounded-2xl space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            className={`w-3.5 h-3.5 ${
                              starIndex < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        &quot;{review.comment}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-[10px] font-bold text-white block">{review.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* AREA DE ATIVACAO DO TOKEN - logo abaixo dos comentários e antes dos planos como exigido */}
            <section
              id="token-activation-area"
              className="bg-gradient-to-r from-zinc-900 to-[#161616] border border-amber-500/10 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="bg-amber-400/10 p-3 rounded-2xl shrink-0">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-black text-white">Ativação de Token de Assinatura</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Insira o token recebido no seu e-mail após a confirmação de pagamento do plano no Kirvano (<strong className="font-mono text-gray-300">K0xyz</strong>).
                  </p>
                </div>
              </div>

              {/* Form Input activation */}
              <form onSubmit={handleActivateTokenSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  <input
                    type="text"
                    placeholder="Ex: K0662 (Formato: K0xyz)"
                    value={planToken}
                    onChange={(e) => setPlanToken(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 focus:border-amber-400/50 outline-none rounded-xl py-2.5 px-4 text-xs text-white placeholder-gray-500 font-mono tracking-widest text-center"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow cursor-pointer uppercase tracking-wider"
                  >
                    Ativar Meu Plano
                  </button>
                </div>

                {tokenResult && (
                  <div className={`p-3 rounded-lg text-xs flex items-start gap-2 animate-fade-in ${
                    tokenResult.success 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{tokenResult.message}</span>
                  </div>
                )}

              </form>
            </section>

            {/* BILLING PLANS COLUMN CARDS row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* PLAN 1: BÁSICO */}
              <div className="bg-[#131313] border border-white/5 hover:border-blue-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-8 transition-all hover:scale-102">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full">
                      Plano Básico
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold line-through">De R$ 39,90</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-3xl font-display font-black text-white flex items-baseline gap-1">
                      R$ 14,90
                      <span className="text-xs text-gray-500 font-normal">/ mensal</span>
                    </h3>
                    <p className="text-xs text-emerald-400 font-bold">Economize mais de 60% com esta promoção!</p>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Ideal para quem deseja reproduzir todo o catálogo de forma econômica em uma única tela.
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-white/5 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Catálogo Completo de Streamings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Qualidade de 1080p a 4K Ultra HD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span><strong className="text-white">1 dispositivo</strong> simultâneo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Acesso Aberto ao Bate-papo global</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <X className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="line-through">Download dos vídeos liberado</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <X className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="line-through">Selo de Membro Premium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Suporte e Ajuda 24h</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://pay.kirvano.com/1c1cb802-cc31-4369-a1e9-5cb6287537aa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Assinar Plano Básico
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* PLAN 2: GOLD */}
              <div className="bg-[#161616] border-2 border-[#f65c41] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-8 transition-all hover:scale-102 transform relative overflow-hidden shadow-[0_12px_36px_rgba(246,92,65,0.15)]">
                
                {/* Visual badge top */}
                <div className="absolute top-0 right-0 bg-[#f65c41] text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-2xl">
                  Mais Popular
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#f65c41]/10 text-[#f65c41] border border-[#f65c41]/25 px-2.5 py-1 rounded-full">
                      Plano Gold Premium
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold line-through">De R$ 67,90</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-3xl font-display font-black text-white flex items-baseline gap-1">
                      R$ 24,90
                      <span className="text-xs text-gray-500 font-normal">/ mensal</span>
                    </h3>
                    <p className="text-xs text-amber-400 font-bold">Qualidade Gold Máxima!</p>
                  </div>

                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    A melhor proporção de custo-benefício para múltiplos dispositivos simultâneos na família.
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-white/5 text-xs text-gray-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#f65c41] shrink-0" />
                      <span>Catálogo Completo Liberado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#f65c41] shrink-0" />
                      <span>Qualidade máxima de 1080p a 4K</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#f65c41] shrink-0" />
                      <span><strong className="text-[#f65c41]">3 dispositivos</strong> simultâneos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#f65c41] shrink-0" />
                      <span>Bate-papo global habilitado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#f65c41] shrink-0" />
                      <span className="font-bold text-white">Download dos vídeos liberado</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <X className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="line-through">Selo de Membro Premium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#f65c41] shrink-0" />
                      <span className="font-semibold text-white">Suporte Premium VIP</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://pay.kirvano.com/b6b40959-b0e1-4c30-8ce7-120a70529cda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#f65c41] hover:bg-[#ff6c54] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Assinar Plano Gold
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* PLAN 3: PREMIUM */}
              <div className="bg-[#131313] border border-white/5 hover:border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-8 transition-all hover:scale-102">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded-full">
                      Plano Premium
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold line-through">De R$ 112,00</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-3xl font-display font-black text-white flex items-baseline gap-1">
                      R$ 87,00
                      <span className="text-xs text-gray-500 font-normal">/ mensal</span>
                    </h3>
                    <p className="text-xs text-amber-400 font-bold">Acesso ilimitado e exclusivo!</p>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    O passe definitivo para maior imersão cinematográfica com criação de críticas VIP e status lendário.
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-white/5 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Catálogo Completo Liberado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Qualidade cinematográfica até 4K</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-bold text-white">Sem Limite de Dispositivos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Acesso ao bate-papo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Download de vídeos liberado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
                        Selo de Membro Premium Ativado
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-bold text-amber-400">Postar comentários e críticas em filmes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Suporte VIP Prioritário 24h</span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://pay.kirvano.com/b0c97b05-1fb5-4a61-8d76-ce56b9374a2f"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs py-3 rounded-xl transition-all shadow text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Assinar Plano Premium
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </section>
          </div>
        )}

        {/* VIEW D: USER SETTINGS PROFILE WITH TOKEN ACTIVATORS */}
        {activeView === 'profile' && (
          <div className="animate-fade-in max-w-2xl mx-auto px-4 mt-6" id="profile-management-panel">
            {!currentUser ? (
              <div className="text-center bg-[#131313] border border-white/5 p-10 rounded-3xl">
                <Lock className="w-12 h-12 text-[#f65c41] mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">Identidade não detectada</p>
                <p className="text-xs text-gray-400 mt-2">Por favor, conecte-se na plataforma para gerenciar as suas credenciais.</p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="mt-4 bg-[#f65c41] hover:bg-[#ff6c54] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow"
                >
                  Fazer Login Agora
                </button>
              </div>
            ) : (
              <div className="space-y-8 text-white">
                
                {/* Header profile details */}
                <div className="border-b border-white/5 pb-4">
                  <h1 className="text-3xl font-display font-black tracking-tight text-white">Configurações de Perfil</h1>
                  <p className="text-xs text-gray-400 mt-1">Personalize sua face, alcunha e alterne planos de transmissão.</p>
                </div>

                {/* Profile form section */}
                <div className="bg-[#131313] border border-white/5 p-6 rounded-3xl space-y-6">
                  
                  {/* Avatar Picker layout */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-white/5 pb-6">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#f65c41] shadow-lg"
                    />

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Foto do seu perfil Kundacine</p>
                      
                      {/* Avatar Presets Selection Grid */}
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {[
                          'https://picsum.photos/seed/avatar1/150/150',
                          'https://picsum.photos/seed/avatar2/150/150',
                          'https://picsum.photos/seed/avatar3/150/150',
                          'https://picsum.photos/seed/avatar4/150/150',
                          'https://picsum.photos/seed/avatar5/150/150',
                        ].map((av, index) => (
                          <button
                            key={index}
                            onClick={() => handleProfileUpdateHelper(currentUser.name, currentUser.nickname, av)}
                            className={`w-8 h-8 rounded-full border overflow-hidden cursor-pointer ${
                              currentUser.avatar === av ? 'border-[#f65c41] scale-105' : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <img src={av} alt="option" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>

                      <div className="pt-1">
                        <input
                          type="text"
                          placeholder="Ou cole uma URL customizada de imagem..."
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              handleProfileUpdateHelper(currentUser.name, currentUser.nickname, e.target.value.trim());
                            }
                          }}
                          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-lg py-1 px-3 text-[10px] text-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nickname, name attributes edit */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nome Completo</label>
                        <input
                          type="text"
                          value={currentUser.name}
                          onChange={(e) => handleProfileUpdateHelper(e.target.value, currentUser.nickname, currentUser.avatar)}
                          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 px-3 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nickname / @Usuário</label>
                        <input
                          type="text"
                          value={currentUser.nickname}
                          onChange={(e) => handleProfileUpdateHelper(currentUser.name, e.target.value, currentUser.avatar)}
                          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 px-3 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">E-mail Cadastrado</label>
                      <input
                        type="text"
                        value={currentUser.email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-gray-500 cursor-not-allowed font-mono"
                      />
                    </div>
                  </div>

                </div>

                {/* SUBSCRIPTION PLAN STATUS CARD */}
                <div className="bg-[#131313] border border-white/5 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Status da Sua Assinatura</h3>
                    
                    <span className="bg-[#f65c41]/20 text-[#f65c41] border border-[#f65c41]/30 py-0.5 px-3.5 rounded-full text-xs font-black uppercase">
                      {currentUser.plan === 'Testador' ? 'Modo de Testes Ativo (3 Dias)' : currentUser.plan}
                    </span>
                  </div>

                  {currentUser.plan === 'Testador' ? (
                    <p className="text-xs text-gray-300">
                      Você está usufruindo de 3 dias de degustação gratuita como se fosse membro <strong className="text-amber-400">Gold</strong>. Faça o upgrade comprando um plano para evitar interrupções no seu acesso assim que o timer zerar!
                    </p>
                  ) : (
                    <p className="text-xs text-gray-300">
                      Sua assinatura <strong className="text-[#f65c41]">{currentUser.plan}</strong> está ativa. Ela foi habilitada via token em <span className="font-semibold text-gray-200">{new Date(currentUser.planActivatedAt || '').toLocaleDateString('pt-BR')}</span>. Desfrute à vontade dos servidores de ultra-alta largura de banda!
                    </p>
                  )}

                  {/* Profile token activation form as specified */}
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-gray-200">Deseja ativar um token de upgrade?</h4>
                    <form onSubmit={handleActivateTokenSubmit} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Insira o seu Token K0xyz aqui..."
                        value={planToken}
                        onChange={(e) => setPlanToken(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 px-3 text-xs font-mono text-center tracking-widest text-white"
                      />
                      <button
                        type="submit"
                        className="bg-[#f65c41] hover:bg-[#ff6c54] text-white text-xs font-bold px-4 rounded-xl cursor-pointer"
                      >
                        Validar Token
                      </button>
                    </form>
                    
                    {tokenResult && (
                      <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                        tokenResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        <AlertCircle className="w-4 h-4" />
                        <span>{tokenResult.message}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* VIEW E: ADMIN CONTROL BOARD WITH RECOMMENDATIONS DISPLAYING */}
        {activeView === 'admin' && (
          <div className="animate-fade-in max-w-4xl mx-auto px-4 mt-6 text-white space-y-6" id="admin-panel-layout">
            
            <div className="border-b border-white/5 pb-4">
              <h1 className="text-3xl font-display font-black tracking-tight text-white flex items-center gap-2">
                <ShieldAlert className="w-8 h-8 text-[#f65c41]" />
                Painel Administrativo Kundacine
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Visualização do painel do administrador. Listando as recomendações inseridas pelos usuários que não encontraram seu conteúdo.
              </p>
            </div>

            {/* Metrics widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#131313] border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total de Pedidos Pendentes</p>
                <p className="text-2xl font-black text-[#f65c41] mt-1">{requestedContents.length}</p>
                <span className="text-[9px] text-gray-500">Adicionar arquivos em até 1 hora máxima</span>
              </div>

              <div className="bg-[#131313] border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Algoritmo Ativo de Tokens</p>
                <p className="text-sm font-black text-white mt-1">K0xyz [Mês, Último Dig Ano, Plano]</p>
                <span className="text-[9px] text-amber-500">Básico (0), Gold (1), Premium (2)</span>
              </div>

              <div className="bg-[#131313] border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Servidor de Transmissão</p>
                <p className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Online na porta 3000 (Stand-alone)
                </p>
                <span className="text-[9px] text-gray-500">HMR Desativada via control plane</span>
              </div>
            </div>

            {/* TABS SELECTOR */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2">
              <button
                onClick={() => setAdminTab('requests')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminTab === 'requests' 
                    ? 'bg-[#f65c41] text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                📋 Pedidos dos Usuários ({requestedContents.length})
              </button>
              <button
                onClick={() => setAdminTab('catalog')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminTab === 'catalog' 
                    ? 'bg-[#f65c41] text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                🎬 Listar & Editar Catálogo ({allContent.length})
              </button>
              <button
                onClick={handleStartAddClick}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  adminTab === 'add' 
                    ? 'bg-[#f65c41] text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Novo Título
              </button>
              {adminTab === 'edit' && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#f65c41]/20 text-[#f65c41] border border-[#f65c41]/30 transition-all cursor-default"
                >
                  ✏️ Editando: {formTitle}
                </button>
              )}
            </div>

            {/* TAB CONTENT A: FILA DE PEDIDOS */}
            {adminTab === 'requests' && (
              <div className="bg-[#131313] border border-white/5 rounded-3xl p-6 space-y-4 animate-fade-in">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-extrabold text-sm text-white">Fila de Recomendações dos Usuários</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Usuários enviaram estes títulos através do formulário de busca rápida extremamente em tempo real.</p>
                </div>

                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {requestedContents.length > 0 ? (
                    requestedContents.map((req) => (
                      <div
                        key={req.id}
                        className="bg-[#181818] hover:bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{req.name}</span>
                            <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-gray-300 font-mono">{req.mediaType}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-2">
                            <span>Solicitado por: <strong className="text-gray-300 font-bold">@{req.userNickname}</strong></span>
                            <span>•</span>
                            <span>{new Date(req.timestamp).toLocaleTimeString('pt-BR')} do dia {new Date(req.timestamp).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>

                        {/* Manual approval action redirects to create form with loaded fields */}
                        <button
                          onClick={() => {
                            setEditFilmId(null);
                            setFormTitle(req.name);
                            setFormDescription(`Título solicitado pelos usuários de nossa plataforma streaming. Disponibilizado na íntegra.`);
                            setFormCategory(req.mediaType === 'Filme' ? 'Filme' : req.mediaType === 'Série' ? 'Série' : req.mediaType === 'Anime' ? 'Anime' : 'Dorama');
                            setFormRating(4.8);
                            setFormYear(2026);
                            setFormGenres('Ação, Drama');
                            setFormVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
                            setFormCoverMobile('https://picsum.photos/seed/kunda_c/600/900');
                            setFormCoverDesktop('https://picsum.photos/seed/kunda_d/1080/720');
                            setFormBackgroundMobile('https://picsum.photos/seed/kunda_bgm/600/400');
                            setFormBackgroundDesktop('https://picsum.photos/seed/kunda_bg/1920/1080');
                            setFormAgeRating('14+');
                            setFormSeasonsJson(`[\n  {\n    "number": 1,\n    "name": "Temporada 1",\n    "episodes": [\n      {\n        "number": 1,\n        "title": "Episódio Piloto",\n        "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",\n        "duration": "24 min"\n      }\n    ]\n  }\n]`);
                            setAdminTab('add');
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          Aprovar & Cadastrar
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 bg-white/5 rounded-2xl">
                      <p className="text-xs text-gray-400">Nenhum pedido de recomendação pendente.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT B: INTERACTIVE CRUD CATALOG */}
            {adminTab === 'catalog' && (
              <div className="bg-[#131313] border border-white/5 rounded-3xl p-6 space-y-4 animate-fade-in text-left">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-extrabold text-sm text-white">Catálogo de Conteúdos Cadastrados ({allContent.length})</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Gerenciador Geral de Títulos. Altere ou delete filmes, animes ou doramas cadastrados.</p>
                </div>

                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1 divide-y divide-white/5">
                  {allContent.map((item) => (
                    <div
                      key={item.id}
                      className="pt-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.coverMobile}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded-lg bg-zinc-800 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-white text-xs">{item.title}</span>
                            <span className="text-[8px] bg-[#f65c41]/15 text-[#f65c41] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide leading-none">{item.category}</span>
                            <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-amber-400 font-extrabold leading-none">★ {item.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 line-clamp-1 max-w-sm sm:max-w-md">{item.description}</p>
                          <div className="text-[9px] text-gray-500 font-bold flex items-center gap-2 flex-wrap pt-0.5">
                            <span>Lançamento: {item.year}</span>
                            <span>•</span>
                            <span>Classificação: {getAgeRating(item)}</span>
                            <span>•</span>
                            <span>Gêneros: {item.genres.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all border border-white/5 cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.title)}
                          className="bg-red-500/10 hover:bg-red-500/25 text-red-400 font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all border border-red-500/10 cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT C: FORM ADD & EDIT FOR CRUD */}
            {(adminTab === 'add' || adminTab === 'edit') && (
              <form onSubmit={handleSaveContent} className="bg-[#131313] border border-white/5 rounded-3xl p-6 space-y-6 text-left animate-fade-in">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-extrabold text-sm text-white">
                    {adminTab === 'add' ? '➕ Cadastrar Novo Vídeo no Catálogo' : `✏️ Editar Vídeo: ${formTitle}`}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Informe as metadados e credenciais da stream de vídeo para que seja exibida na home grade.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      Título do Filme ou Série
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2.5 px-3.5 text-xs text-white"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      Categoria / Tipo
                    </label>
                    <select
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2.5 px-3.5 text-xs text-white font-bold"
                      value={formCategory}
                      onChange={(e: any) => setFormCategory(e.target.value)}
                    >
                      <option value="Filme">Filme</option>
                      <option value="Série">Série</option>
                      <option value="Anime">Anime</option>
                      <option value="Dorama">Dorama</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      Avaliação Média (0.0 a 5.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2.5 px-3.5 text-xs text-white"
                      value={formRating}
                      onChange={(e) => setFormRating(Number(e.target.value))}
                      required
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      Ano de Lançamento
                    </label>
                    <input
                      type="number"
                      step="1"
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2.5 px-3.5 text-xs text-white"
                      value={formYear}
                      onChange={(e) => setFormYear(Number(e.target.value))}
                      required
                    />
                  </div>

                  {/* Genres */}
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      Gêneros (separados por vírgula)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2.5 px-3.5 text-xs text-white"
                      value={formGenres}
                      onChange={(e) => setFormGenres(e.target.value)}
                      required
                    />
                  </div>

                  {/* Age Rating */}
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      Classificação Indicativa (classificação etária)
                    </label>
                    <select
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2.5 px-3.5 text-xs text-white font-bold"
                      value={formAgeRating}
                      onChange={(e) => setFormAgeRating(e.target.value)}
                    >
                      <option value="Livre">Livre</option>
                      <option value="12+">12+</option>
                      <option value="14+">14+</option>
                      <option value="16+">16+</option>
                      <option value="18+">18+</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                    Sinopse Curta
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2.5 px-3.5 text-xs text-white resize-none"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Assets URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      Capa Mobile (350x500)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 px-3 text-[11px] text-white"
                      value={formCoverMobile}
                      onChange={(e) => setFormCoverMobile(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      Capa Desktop (1080x720)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 px-3 text-[11px] text-white"
                      value={formCoverDesktop}
                      onChange={(e) => setFormCoverDesktop(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      Backdrop Mobile (600x400)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 px-3 text-[11px] text-white"
                      value={formBackgroundMobile}
                      onChange={(e) => setFormBackgroundMobile(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      Backdrop Desktop (1920x1080)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2 px-3 text-[11px] text-white"
                      value={formBackgroundDesktop}
                      onChange={(e) => setFormBackgroundDesktop(e.target.value)}
                    />
                  </div>
                </div>

                {/* Conditional stream configs */}
                {formCategory === 'Filme' ? (
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5 font-mono">
                      URL da Stream MP4 do Vídeo (Filme)
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2.5 px-3.5 text-xs text-white animate-fade-in"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider font-mono">
                        Seasons & Episodes JSON (Estrutura Completa de Temporadas)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormSeasonsJson(`[\n  {\n    "number": 1,\n    "name": "Temporada 1",\n    "episodes": [\n      {\n        "number": 1,\n        "title": "Episódio Piloto",\n        "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",\n        "duration": "24 min"\n      },\n      {\n        "number": 2,\n        "title": "A Jornada Começa",\n        "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",\n        "duration": "22 min"\n      }\n    ]\n  }\n]`);
                        }}
                        className="text-[10px] text-[#f65c41] hover:underline cursor-pointer font-bold"
                      >
                        ⚡ Carregar Template de Série
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      className="w-full bg-[#181818] border border-white/10 focus:border-[#f65c41]/50 outline-none rounded-xl py-2.5 px-3.5 text-[11px] font-mono text-gray-300 resize-y"
                      value={formSeasonsJson}
                      onChange={(e) => setFormSeasonsJson(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Submit actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5 font-bold">
                  <button
                    type="submit"
                    className="bg-[#f65c41] hover:bg-[#ff6c54] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTab('catalog')}
                    className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs px-6 py-3 rounded-xl transition-all border border-white/5 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* VIEW F: TERMS OF USE DESIGN */}
        {activeView === 'terms' && (
          <div className="animate-fade-in max-w-4xl mx-auto px-4 text-white mt-6 space-y-4" id="terms-of-use-panel">
            <h1 className="text-3xl font-display font-black text-white">Termos de Uso do KundaCine</h1>
            <p className="text-xs text-gray-500">Última atualização: 18 de Junho de 2026</p>
            <div className="bg-[#131313] border border-white/5 p-6 rounded-3xl text-xs text-gray-300 space-y-4 leading-relaxed">
              <p>
                Bem-vindo ao <strong>KundaCine</strong>. Ao acessar o nosso portal de streaming e assinar nossos serviços, você concorda em cumprir e estar vinculado a estes Termos de Uso.
              </p>
              <h3 className="font-extrabold text-sm text-white pt-2">1. Elegibilidade e Cadastro</h3>
              <p>
                Para usufruir de nossos planos de transmissão de entretenimento (Básico, Gold ou Premium), o usuário deve criar uma conta utilizando um e-mail válido ou fazer login através de SSO Google com fidedignidade de identidade.
              </p>
              <h3 className="font-extrabold text-sm text-white pt-2">2. Proibição de Compartilhamento Arbitrário</h3>
              <p>
                Os planos possuem restrições técnicas específicas de transmissão simultânea. O plano Básico dá suporte a 1 tela, o Gold a 3 telas, e o Premium é de uso sem impeditivos. Infrações recorrentes de logins simultâneos fora do plano podem suspender a conta temporariamente para fins de integridade dos servidores.
              </p>
              <h3 className="font-extrabold text-sm text-white pt-2">3. Política de Reembolso e Transações por Token</h3>
              <p>
                O processamento financeiro é integralizado sob responsabilidade do processador parceiro Kirvano. Após conclusão da compra, o token de chave <strong className="font-mono">K0xyz</strong> é remetido ao e-mail cadastrado e deve ser mantido sob sigilo. A ativação do token conclui a entrega integral dos benefícios, limitando reembolsos a prerrogativas previstas em lei.
              </p>
            </div>
          </div>
        )}

        {/* VIEW G: PRIVACY POLICY DESIGN */}
        {activeView === 'privacy' && (
          <div className="animate-fade-in max-w-4xl mx-auto px-4 text-white mt-6 space-y-4" id="privacy-policy-panel">
            <h1 className="text-3xl font-display font-black text-white">Políticas de Privacidade</h1>
            <p className="text-xs text-gray-500">Última atualização: 18 de Junho de 2026</p>
            <div className="bg-[#131313] border border-white/5 p-6 rounded-3xl text-xs text-gray-300 space-y-4 leading-relaxed">
              <p>
                A sua privacidade é prioridade para o <strong>KundaCine</strong>. Esta página informa sobre nossas práticas de coleta, utilização e sigilo estrito de informações pessoais.
              </p>
              <h3 className="font-extrabold text-sm text-white pt-2">1. Coleta de Informações</h3>
              <p>
                Coletamos seu e-mail, nome, nickname de usuário e estatísticas de progresso de visualização de obras em cache local para compor a prateleira do &quot;Continue Assistindo&quot;. Nenhuma destas informações é repassada ou comercializada a terceiros.
              </p>
              <h3 className="font-extrabold text-sm text-white pt-2">2. Autenticação e Segurança Google</h3>
              <p>
                O fluxo de Login via Google utiliza barramentos padrão de segurança das APIs públicas que visam apenas confirmar a legitimidade de identidade para criação automatizada de perfis com direito de teste de 3 dias sem exposição de credenciais confidenciais.
              </p>
              <h3 className="font-extrabold text-sm text-white pt-2">3. Segurança dos Dados</h3>
              <p>
                Utilizamos armazenamento local altamente criptografado no seu navegador para manter sua sessão fluida e livre de travamentos no reprodutor de vídeo.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* UNIVERSAL PROFESSIONAL NETFLIX-LIKE FOOTER */}
      <footer id="kundacine-footer" className="bg-[#101010] border-t border-white/5 py-10 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Column 1 - Brand Info */}
            <div className="space-y-3.5 col-span-2 md:col-span-1">
              <Logo size="sm" />
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-xs">
                A melhor plataforma de streaming com filmes, séries, anime e dorama do Brasil. Alta estabilidade de reprodução com CDN exclusiva de menor latência da américa latina.
              </p>
            </div>

            {/* Column 2 - Category Shortcuts */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white text-[11px] uppercase tracking-widest">Gêneros</h4>
              <ul className="space-y-2 text-[11px] text-gray-400">
                <li><button onClick={() => { setView('films'); setGenreFilter('Ação'); window.scrollTo(0, 0); }} className="hover:text-[#f65c41] transition-colors cursor-pointer text-left">Ação e Combates</button></li>
                <li><button onClick={() => { setView('films'); setGenreFilter('Drama'); window.scrollTo(0, 0); }} className="hover:text-[#f65c41] transition-colors cursor-pointer text-left">Dramas Intensos</button></li>
                <li><button onClick={() => { setView('series'); setGenreFilter('Ficção Científica'); window.scrollTo(0, 0); }} className="hover:text-[#f65c41] transition-colors cursor-pointer text-left">Ficção Científica</button></li>
                <li><button onClick={() => { setView('films'); setGenreFilter('Suspense'); window.scrollTo(0, 0); }} className="hover:text-[#f65c41] transition-colors cursor-pointer text-left">Suspenses e Mistérios</button></li>
              </ul>
            </div>

            {/* Column 3 - Corporate & Legal Links */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-[#f65c41] text-[11px] uppercase tracking-widest text-glow">Links Corporativos</h4>
              <ul className="space-y-2 text-[11px] text-gray-400">
                <li><button onClick={() => { setView('plans'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors cursor-pointer">Assinatura de Planos</button></li>
                <li><button onClick={() => { setView('terms'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors cursor-pointer">Termos de Uso</button></li>
                <li><button onClick={() => { setView('privacy'); window.scrollTo(0, 0); }} className="hover:text-white transition-colors cursor-pointer">Políticas de Privacidade</button></li>
                <li><button onClick={() => alert('Central de ajuda online! Abra o balão de chat no canto inferior direito para falar instantaneamente com nossos atendentes.')} className="hover:text-white transition-colors cursor-pointer">Telefones Central de Ajuda</button></li>
              </ul>
            </div>

            {/* Column 4 - Contact email and social icon buttons */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-white text-[11px] uppercase tracking-widest">Nossas Redes</h4>
              <p className="text-[10px] text-gray-500">Siga para novidades diárias e sorteios de assinaturas:</p>
              
              <div className="flex items-center gap-2">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-[#f65c41]/20 border border-white/5 p-2 rounded-xl text-gray-400 hover:text-white transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-[#f65c41]/20 border border-white/5 p-2 rounded-xl text-gray-400 hover:text-white transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-[#f65c41]/20 border border-white/5 p-2 rounded-xl text-gray-400 hover:text-white transition-all">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="mailto:suporte@kundacine.com" className="bg-white/5 hover:bg-[#f65c41]/20 border border-white/5 p-2 rounded-xl text-gray-400 hover:text-white transition-all">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-gray-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} Kundacine Streaming Brasil Ltda. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
              <Sparkles className="w-3.5 h-3.5 text-[#f65c41]" />
              <span>Transmissão em Full HD e 4K HDR nativo com CDN de latência zero</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );

  // Profile update handler mapping
  function handleProfileUpdateHelper(name: string, nick: string, av: string) {
    const cleanNick = nick.toLowerCase().replace(/\s+/g, '_');
    updateProfile(name, cleanNick, av);
  }
}
