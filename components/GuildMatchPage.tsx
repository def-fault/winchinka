import React, { useState, useEffect, useRef } from 'react';
import { GUILD_TEAMS } from '../constants';
import {
  HeartIcon,
  TrophyIcon,
  CameraIcon,
  MessageCircleIcon,
  SendIcon,
  TrashIcon,
  ShieldIcon
} from './Icons';
import {
  db,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  deleteDoc,
  deleteField,
  where,
  getDocs
} from '../services/firebase';

const BASE_PATH = import.meta.env.BASE_URL || '/';

const resolvePublicAsset = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  const baseUrl = typeof document !== 'undefined'
    ? new URL(BASE_PATH, document.baseURI)
    : new URL(BASE_PATH, 'http://localhost/');

  return new URL(normalizedPath, baseUrl).href;
};

const ADMIN_PASSWORD = 'dash';
const DEVICE_ID_KEY = 'winchinka_chat_device_id';
const MY_SHOUTS_KEY = 'winchinka_my_shout_ids';
const NICKNAME_KEY = 'winchinka_chat_nickname';

// Initial cheer counts all start at 0
const DEFAULT_CHEERS: Record<string, number> = {
  'guild-1': 0, // 청도복숭아
  'guild-2': 0, // 윈슬사령해
  'guild-3': 0, // 무례하긴, 순애야
  'guild-4': 0, // 에고머니나
  'guild-5': 0, // 투신은사냥길드
  'guild-6': 0, // 그냥해설만할게요
  'guild-7': 0, // 숙주야 사랑해
  'guild-8': 0, // 픽키와 친구들
};

export interface GuildShout {
  id: string;
  nickname: string;
  message: string;
  teamName?: string;
  createdAt: number;
  authorId?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

// Format relative time helper
const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return '방금 전';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
};

// Helper to compress uploaded image into a compact Base64 webp/jpeg string for Firestore storage
const compressImage = (file: File, maxDimension = 320, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const GuildMatchPage: React.FC = () => {
  const [cheerCounts, setCheerCounts] = useState<Record<string, number>>(DEFAULT_CHEERS);
  const [teamImages, setTeamImages] = useState<Record<string, string>>({});
  const [teamImagesMeta, setTeamImagesMeta] = useState<Record<string, { uploaderId: string }>>({});
  const [bannedUsers, setBannedUsers] = useState<Record<string, { bannedAt: number }>>({});
  const [shouts, setShouts] = useState<GuildShout[]>([]);

  const [uploadingTeamId, setUploadingTeamId] = useState<string | null>(null);
  const [clickedTeamId, setClickedTeamId] = useState<string | null>(null);
  const [particles, setParticles] = useState<Record<string, Particle[]>>({});

  // Device ID for author identification and banning
  const [deviceId] = useState(() => {
    try {
      let id = localStorage.getItem(DEVICE_ID_KEY);
      if (!id) {
        id = 'dev-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem(DEVICE_ID_KEY, id);
      }
      return id;
    } catch {
      return 'dev-' + Date.now();
    }
  });

  const isBanned = Boolean(deviceId && bannedUsers[deviceId]);

  // Locally stored sent shout IDs
  const [myShoutIds, setMyShoutIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(MY_SHOUTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Chat inputs
  const [nickname, setNickname] = useState(() => {
    try {
      return localStorage.getItem(NICKNAME_KEY) || '';
    } catch {
      return '';
    }
  });
  const [message, setMessage] = useState('');
  const [selectedTeamTag, setSelectedTeamTag] = useState<string>('전체');
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedTeamForUploadRef = useRef<string | null>(null);

  // Real-time synchronization for cheer counts
  useEffect(() => {
    const cheersDocRef = doc(db, 'guild_matches', 'cheers');
    const unsubscribeCheers = onSnapshot(
      cheersDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setCheerCounts((prev) => ({
            ...prev,
            ...data,
          }));
        } else {
          setDoc(cheersDocRef, DEFAULT_CHEERS, { merge: true }).catch((err) => {
            console.warn('Firestore initial set error:', err);
          });
        }
      },
      (error) => {
        console.warn('Firestore realtime sync error (cheers):', error);
      }
    );

    // Real-time synchronization for team images
    const imagesDocRef = doc(db, 'guild_matches', 'team_images');
    const unsubscribeImages = onSnapshot(
      imagesDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setTeamImages(snapshot.data() as Record<string, string>);
        }
      },
      (error) => {
        console.warn('Firestore realtime sync error (images):', error);
      }
    );

    // Real-time synchronization for team images metadata (uploader tracking)
    const imagesMetaDocRef = doc(db, 'guild_matches', 'team_images_meta');
    const unsubscribeImagesMeta = onSnapshot(
      imagesMetaDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setTeamImagesMeta(snapshot.data() as Record<string, { uploaderId: string }>);
        }
      },
      (error) => {
        console.warn('Firestore realtime sync error (images_meta):', error);
      }
    );

    // Real-time synchronization for banned users
    const bannedDocRef = doc(db, 'guild_matches', 'banned_users');
    const unsubscribeBanned = onSnapshot(
      bannedDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setBannedUsers(snapshot.data() as Record<string, { bannedAt: number }>);
        }
      },
      (error) => {
        console.warn('Firestore realtime sync error (banned_users):', error);
      }
    );

    // Real-time synchronization for live shouts / chat
    const shoutsQuery = query(
      collection(db, 'guild_shouts'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const unsubscribeShouts = onSnapshot(
      shoutsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedShouts: GuildShout[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loadedShouts.push({
              id: docSnap.id,
              nickname: data.nickname || '익명',
              message: data.message || '',
              teamName: data.teamName || '전체',
              createdAt: data.createdAt || Date.now(),
              authorId: data.authorId,
            });
          });
          setShouts(loadedShouts);
        } else {
          setShouts([]);
        }
      },
      (error) => {
        console.warn('Firestore realtime sync error (shouts):', error);
      }
    );

    return () => {
      unsubscribeCheers();
      unsubscribeImages();
      unsubscribeImagesMeta();
      unsubscribeBanned();
      unsubscribeShouts();
    };
  }, []);

  const triggerImageUpload = (teamId: string) => {
    if (isBanned) {
      alert('관리자에 의해 활동이 차단된 이용자입니다냥!');
      return;
    }
    selectedTeamForUploadRef.current = teamId;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const teamId = selectedTeamForUploadRef.current;
    if (!file || !teamId) return;

    if (isBanned) {
      alert('관리자에 의해 활동이 차단된 이용자입니다냥!');
      return;
    }

    setUploadingTeamId(teamId);

    try {
      const compressedDataUrl = await compressImage(file, 320, 0.85);

      // Optimistic UI update
      setTeamImages((prev) => ({
        ...prev,
        [teamId]: compressedDataUrl,
      }));

      // Realtime Firestore save image
      const imagesDocRef = doc(db, 'guild_matches', 'team_images');
      await setDoc(
        imagesDocRef,
        {
          [teamId]: compressedDataUrl,
        },
        { merge: true }
      );

      // Realtime Firestore save uploader metadata
      const metaDocRef = doc(db, 'guild_matches', 'team_images_meta');
      await setDoc(
        metaDocRef,
        {
          [teamId]: {
            uploaderId: deviceId,
            uploadedAt: Date.now(),
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('이미지 업로드에 실패했다냥!');
    } finally {
      setUploadingTeamId(null);
      selectedTeamForUploadRef.current = null;
    }
  };

  // Admin function to reset inappropriate team image and ban the uploader
  const handleResetTeamImageAndBan = async (teamId: string, teamName: string) => {
    const inputPw = window.prompt('관리자 비밀번호를 입력해주세요:');
    if (!inputPw) return;
    if (inputPw !== ADMIN_PASSWORD) {
      alert('관리자 비밀번호가 일치하지 않는다냥!');
      return;
    }

    if (!window.confirm(`'${teamName}'의 등록된 사진을 트로피로 초기화하고, 해당 사진을 올린 이용자를 차단할까요냥?`)) {
      return;
    }

    try {
      // 1. Delete image from team_images
      const imagesDocRef = doc(db, 'guild_matches', 'team_images');
      await updateDoc(imagesDocRef, {
        [teamId]: deleteField(),
      });

      // Optimistic removal
      setTeamImages((prev) => {
        const copy = { ...prev };
        delete copy[teamId];
        return copy;
      });

      // 2. Ban uploader if ID is recorded
      const uploaderId = teamImagesMeta[teamId]?.uploaderId;
      if (uploaderId) {
        const bannedDocRef = doc(db, 'guild_matches', 'banned_users');
        await setDoc(
          bannedDocRef,
          {
            [uploaderId]: {
              bannedAt: Date.now(),
              reason: `팀(${teamName}) 불건전 사진 업로드`,
            },
          },
          { merge: true }
        );
        alert('사진이 초기화되었고, 업로더가 성공적으로 차단되었다냥!');
      } else {
        alert('사진이 기본 트로피로 초기화되었다냥!');
      }
    } catch (err) {
      console.error('Failed to reset image or ban uploader:', err);
      alert('사진 초기화 및 차단 처리에 실패했다냥!');
    }
  };

  const handleCheer = async (teamId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (isBanned) {
      alert('관리자에 의해 활동이 차단된 이용자입니다냥!');
      return;
    }

    // 1. Optimistic UI update
    setCheerCounts((prev) => ({
      ...prev,
      [teamId]: (prev[teamId] || 0) + 1,
    }));

    setClickedTeamId(teamId);
    setTimeout(() => setClickedTeamId(null), 300);

    // 2. Floating particle animation
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: clickX,
      y: clickY,
    };

    setParticles((prev) => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []).slice(-4), newParticle],
    }));

    setTimeout(() => {
      setParticles((prev) => ({
        ...prev,
        [teamId]: (prev[teamId] || []).filter((p) => p.id !== newParticle.id),
      }));
    }, 1000);

    // 3. Realtime Firestore update with atomic increment
    try {
      const cheersDocRef = doc(db, 'guild_matches', 'cheers');
      await setDoc(
        cheersDocRef,
        {
          [teamId]: increment(1),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Failed to update cheer count in Firebase:', err);
    }
  };

  const handleSendShout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBanned) {
      alert('관리자에 의해 활동이 차단된 이용자입니다냥!');
      return;
    }

    const trimmedMsg = message.trim();
    if (!trimmedMsg || isSending) return;

    const finalNickname = nickname.trim() || '익명의모험가';

    try {
      localStorage.setItem(NICKNAME_KEY, finalNickname);
    } catch {
      // ignore
    }

    setIsSending(true);

    const tempId = `local-${Date.now()}`;
    const newShout: GuildShout = {
      id: tempId,
      nickname: finalNickname,
      message: trimmedMsg,
      teamName: selectedTeamTag,
      createdAt: Date.now(),
      authorId: deviceId,
    };

    // Optimistic local update
    setShouts((prev) => [newShout, ...prev.slice(0, 29)]);
    setMessage('');

    try {
      const docRef = await addDoc(collection(db, 'guild_shouts'), {
        nickname: finalNickname,
        message: trimmedMsg,
        teamName: selectedTeamTag,
        createdAt: Date.now(),
        authorId: deviceId,
      });

      // Save to myShoutIds
      setMyShoutIds((prev) => {
        const updated = [...prev, docRef.id];
        try {
          localStorage.setItem(MY_SHOUTS_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    } catch (err) {
      console.warn('Failed to send shout to Firebase (check Firestore setup):', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteShout = async (shout: GuildShout) => {
    const isAuthor = shout.authorId === deviceId || myShoutIds.includes(shout.id);

    if (isAuthor) {
      if (!window.confirm('내가 작성한 이 응원 메시지를 삭제할까요냥?')) {
        return;
      }
    } else {
      const inputPw = window.prompt('관리자 비밀번호를 입력해주세요:');
      if (!inputPw) return;
      if (inputPw !== ADMIN_PASSWORD) {
        alert('관리자 비밀번호가 일치하지 않는다냥!');
        return;
      }
    }

    // Optimistic UI removal
    setShouts((prev) => prev.filter((s) => s.id !== shout.id));

    try {
      if (!shout.id.startsWith('local-')) {
        await deleteDoc(doc(db, 'guild_shouts', shout.id));
      }
    } catch (err) {
      console.error('Failed to delete shout from Firebase:', err);
      alert('메시지 삭제 처리에 실패했다냥!');
    }
  };

  // Admin function to ban author and delete all their messages
  const handleBanUserAndPurgeShouts = async (shout: GuildShout) => {
    const inputPw = window.prompt('관리자 비밀번호를 입력해주세요:');
    if (!inputPw) return;
    if (inputPw !== ADMIN_PASSWORD) {
      alert('관리자 비밀번호가 일치하지 않는다냥!');
      return;
    }

    const targetAuthorId = shout.authorId;
    if (!targetAuthorId) {
      await deleteDoc(doc(db, 'guild_shouts', shout.id));
      setShouts((prev) => prev.filter((s) => s.id !== shout.id));
      alert('해당 메시지가 삭제되었다냥!');
      return;
    }

    if (!window.confirm(`작성자 '${shout.nickname}'님을 영구 차단하고, 작성한 모든 글을 일괄 삭제할까요냥?`)) {
      return;
    }

    try {
      // 1. Add authorId to banned_users in Firestore
      const bannedDocRef = doc(db, 'guild_matches', 'banned_users');
      await setDoc(
        bannedDocRef,
        {
          [targetAuthorId]: {
            bannedAt: Date.now(),
            nickname: shout.nickname,
            reason: '불건전 채팅 작성',
          },
        },
        { merge: true }
      );

      // 2. Query and delete all shouts by this author
      const q = query(collection(db, 'guild_shouts'), where('authorId', '==', targetAuthorId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // Optimistic local UI removal
      setShouts((prev) => prev.filter((s) => s.authorId !== targetAuthorId));

      alert(`작성자 '${shout.nickname}'님이 성공적으로 차단되었고 작성 글이 모두 일괄 삭제되었다냥!`);
    } catch (err) {
      console.error('Failed to ban user and purge shouts:', err);
      alert('유저 차단 및 글 일괄 삭제 처리에 실패했다냥!');
    }
  };

  // Filter out any shouts from banned users
  const visibleShouts = shouts.filter((s) => !s.authorId || !bannedUsers[s.authorId]);

  // Repeated shouts list for seamless continuous ticker loop
  const marqueeShouts = visibleShouts.length > 0 ? [...visibleShouts, ...visibleShouts] : [];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-12 pb-16">
      {/* Hidden file input for team image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Banned Alert Banner for Banned User */}
      {isBanned && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-300 text-sm text-center font-bold flex items-center justify-center gap-2 shadow-lg">
          <ShieldIcon className="w-5 h-5 text-red-400" />
          <span>관리자에 의해 활동이 차단된 기기(이용자)입니다. 채팅 작성 및 사진 업로드가 제한됩니다.</span>
        </div>
      )}

      {/* Title Header Section */}
      <section className="text-center relative pt-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative inline-block mb-4">
          <img
            src={resolvePublicAsset('guild_title.png')}
            alt="길드 친선전"
            className="h-28 sm:h-36 md:h-48 w-auto mx-auto object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 transition-transform duration-300"
          />
        </div>

        <p className="text-sm md:text-base text-gray-300 mt-2 font-medium">
          당신의 팀을 응원해주세요!
        </p>
      </section>

      {/* ─── LIVE LED Marquee Billboard (실시간 응원 메시지가 있을 때만 노출) ─── */}
      {visibleShouts.length > 0 && (
        <section className="relative">
          <div className="glass-panel relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-3 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center gap-4">
            {/* LED Grid subtle pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

            {/* Marquee Header Badge */}
            <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold whitespace-nowrap shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>LIVE 전광판</span>
            </div>

            {/* Scrolling Ticker Track */}
            <div className="relative z-10 overflow-hidden flex-grow marquee-container">
              <div className="marquee-track flex items-center gap-10">
                {marqueeShouts.map((shout, idx) => (
                  <div
                    key={`${shout.id}-${idx}`}
                    className="inline-flex items-center gap-2.5 text-sm md:text-base whitespace-nowrap"
                  >
                    {shout.teamName && shout.teamName !== '전체' && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        {shout.teamName}
                      </span>
                    )}
                    <span className="text-emerald-400 font-bold tracking-wide">
                      {shout.nickname}
                    </span>
                    <span className="text-gray-400">:</span>
                    <span className="text-white font-medium drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                      {shout.message}
                    </span>
                    <span className="text-emerald-500/40 ml-4 font-bold">•</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4x2 Matrix Grid of 8 Teams */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-cyan-500 rounded-full" />
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              참가 팀 목록
            </h2>
          </div>
          <span className="text-xs md:text-sm text-gray-400">
            총 <span className="text-emerald-400 font-bold">{GUILD_TEAMS.length}</span>개 팀
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GUILD_TEAMS.map((team) => {
            const count = cheerCounts[team.id] || 0;
            const isPulsing = clickedTeamId === team.id;
            const teamParticles = particles[team.id] || [];
            const customImage = teamImages[team.id];
            const isUploading = uploadingTeamId === team.id;

            return (
              <div
                key={team.id}
                className="glass-panel relative bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-white/10 hover:border-emerald-400/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:-translate-y-1 group"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />

                {/* Card Header: Reset/Ban Button (Admin) & Cheer Count Badge */}
                <div className="flex items-center justify-between mb-2 relative z-10">
                  {customImage ? (
                    <button
                      type="button"
                      onClick={() => handleResetTeamImageAndBan(team.id, team.name)}
                      title="관리자: 사진 초기화 및 업로더 차단"
                      className="text-[11px] text-gray-500 hover:text-gray-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity py-0.5 px-1.5 rounded bg-white/5 hover:bg-white/10"
                    >
                      <ShieldIcon className="w-3 h-3 text-gray-500 hover:text-gray-300" />
                      <span>초기화</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <HeartIcon className="w-4 h-4 fill-emerald-500/20 text-emerald-400" />
                    <span className="tabular-nums">{count.toLocaleString()}</span>
                  </div>
                </div>

                {/* Team Name and Clickable Picture/Trophy Container */}
                <div className="my-6 text-center relative z-10 flex-grow flex flex-col items-center justify-center">
                  <div
                    onClick={() => triggerImageUpload(team.id)}
                    title="클릭하여 팀 사진 변경하기"
                    className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-2 border-emerald-500/30 flex items-center justify-center cursor-pointer overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.15)] group/avatar hover:scale-105 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300"
                  >
                    {customImage ? (
                      <img
                        src={customImage}
                        alt={team.name}
                        className="w-full h-full object-cover rounded-3xl transition-transform duration-300 group-hover/avatar:scale-110"
                      />
                    ) : (
                      <TrophyIcon className="w-10 h-10 md:w-12 md:h-12 text-emerald-400 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                    )}

                    {/* Hover Upload Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-3xl flex flex-col items-center justify-center text-white text-[11px] font-medium gap-1 backdrop-blur-[2px]">
                      <CameraIcon className="w-5 h-5 text-emerald-300" />
                      <span>{customImage ? '사진 변경' : '사진 등록'}</span>
                    </div>

                    {/* Upload Spinner */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/75 rounded-3xl flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight">
                    {team.name}
                  </h3>
                </div>

                {/* Cheer Button with Particles */}
                <div className="relative z-10 mt-auto pt-2">
                  <button
                    onClick={(e) => handleCheer(team.id, e)}
                    disabled={isBanned}
                    className={`w-full relative overflow-hidden py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white transition-all duration-200 ${
                      isBanned
                        ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                        : isPulsing
                        ? 'scale-95 bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.8)]'
                        : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 shadow-lg shadow-emerald-500/25 hover:shadow-cyan-500/40 active:scale-95'
                    }`}
                  >
                    <HeartIcon className={`w-5 h-5 transition-transform ${isPulsing ? 'scale-125 fill-white' : 'fill-white/80'}`} />
                    <span>응원하기</span>
                  </button>

                  {/* Floating Particles */}
                  {teamParticles.map((p) => (
                    <span
                      key={p.id}
                      className="absolute pointer-events-none text-emerald-400 font-extrabold text-sm"
                      style={{
                        left: `${p.x}px`,
                        top: `${p.y - 30}px`,
                        animation: 'floatUp 0.8s ease-out forwards',
                      }}
                    >
                      +1 💚
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── LIVE CHAT / SHOUTOUT SECTION ───────────────────────────────── */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-emerald-500 rounded-full" />
          <div className="flex items-center gap-2">
            <MessageCircleIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              실시간 응원 채팅
            </h2>
          </div>
          <span className="text-xs text-gray-400 ml-2">
            전송된 응원은 상단 전광판에 즉시 흘러나옵니다!
          </span>
        </div>

        <div className="glass-panel relative rounded-2xl border border-white/10 bg-slate-900/70 p-6 space-y-6 shadow-xl backdrop-blur-md">
          {/* Shout Input Form */}
          <form onSubmit={handleSendShout} className="space-y-4">
            {/* Team Tag Selection Bar */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">응원할 팀 선택 (선택 사항)</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTeamTag('전체')}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                    selectedTeamTag === '전체'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  전체 응원
                </button>
                {GUILD_TEAMS.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedTeamTag(team.name)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                      selectedTeamTag === team.name
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/30 font-bold'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs: Nickname & Message */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={nickname}
                disabled={isBanned}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임 (기본: 익명의모험가)"
                maxLength={15}
                className="sm:w-48 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />

              <div className="flex-grow flex gap-2">
                <input
                  type="text"
                  value={message}
                  disabled={isBanned}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isBanned
                      ? '관리자에 의해 활동이 차단되었습니다.'
                      : '응원의 한마디를 남겨보세요! (최대 80자)'
                  }
                  maxLength={80}
                  className="flex-grow px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />

                <button
                  type="submit"
                  disabled={!message.trim() || isSending || isBanned}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 whitespace-nowrap"
                >
                  <SendIcon className="w-4 h-4" />
                  <span>전송</span>
                </button>
              </div>
            </div>
          </form>

          {/* Chat Message List Feed */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
              <span>최신 응원 메시지</span>
              <span>실시간 동기화 중 🟢</span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
              {visibleShouts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  등록된 응원 메시지가 없습니다.
                </div>
              ) : (
                visibleShouts.map((shout) => {
                  const isAuthor = shout.authorId === deviceId || myShoutIds.includes(shout.id);

                  return (
                    <div
                      key={shout.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-white/5 hover:border-emerald-500/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm group/msg"
                    >
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {shout.teamName && shout.teamName !== '전체' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                            {shout.teamName}
                          </span>
                        )}
                        <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                          {shout.nickname}
                        </span>
                        <span className="text-gray-200">
                          {shout.message}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <span className="text-[11px] text-gray-500 whitespace-nowrap">
                          {formatRelativeTime(shout.createdAt)}
                        </span>

                        {/* Admin: Ban User & Purge All Shouts */}
                        <button
                          type="button"
                          onClick={() => handleBanUserAndPurgeShouts(shout)}
                          title="관리자: 이 유저 차단 및 글 일괄 삭제"
                          className="p-1 rounded-md text-gray-500/60 hover:text-gray-300 hover:bg-white/10 opacity-0 group-hover/msg:opacity-100 transition-all"
                        >
                          <ShieldIcon className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
                        </button>

                        {/* Delete Button (Author directly / Admin with password) */}
                        <button
                          type="button"
                          onClick={() => handleDeleteShout(shout)}
                          title={isAuthor ? '내 메시지 삭제' : '관리자: 메시지 삭제'}
                          className={`p-1 rounded-md transition-all ${
                            isAuthor
                              ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10'
                              : 'text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover/msg:opacity-100'
                          }`}
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Inline styles for custom floating particle animation and Marquee */}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(1.3);
          }
        }

        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee-container {
          mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
        }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 40s linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </div>
  );
};

export default GuildMatchPage;
