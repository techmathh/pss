import React from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Layout from '../components/ui/Layout';
import { User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../lib/useSettings';

interface BoardMember {
  id: string;
  name: string;
  position: string;
  order: number;
  imageUrl?: string;
}

interface BoardRole {
  id: string;
  name: string;
  order: number;
}

export default function Pengurus() {
  const { settings } = useSettings();
  const { data: board = [], isLoading: isLoadingBoard } = useQuery<BoardMember[]>({
    queryKey: ['board_members'],
    queryFn: async () => {
      try {
        const q = query(collection(db, 'board_members'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BoardMember));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'board_members');
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery<BoardRole[]>({
    queryKey: ['board_roles'],
    queryFn: async () => {
      try {
        const q = query(collection(db, 'board_roles'), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BoardRole));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'board_roles');
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = isLoadingBoard || isLoadingRoles;

  // Use roles if available, otherwise just extract unique positions from board to avoid breaking if roles aren't fetched
  const orderedRoles = roles.length > 0 ? roles.map(r => r.name) : Array.from(new Set(board.map(m => m.position)));

  const boardByRole = orderedRoles.map(role => ({
    role,
    members: board.filter(member => member.position === role)
  })).filter(group => group.members.length > 0);

  // Catch any members whose role isn't in orderedRoles string array
  const otherMembers = board.filter(member => !orderedRoles.includes(member.position));
  if (otherMembers.length > 0) {
    boardByRole.push({ role: 'Lainnya', members: otherMembers });
  }

  return (
    <Layout>
       <Helmet>
        <title>Struktur Pengurus | {settings.name || 'Pencak Silat SMAN'}</title>
        <meta name="description" content={`Mengenal lebih dekat para pengurus yang berdedikasi tinggi di ${settings.name}.`} />
        <meta property="og:title" content={`Struktur Pengurus | ${settings.name}`} />
        <meta property="og:description" content={`Kenali para pengurus yang berdedikasi di ${settings.name}.`} />
        <meta property="og:image" content={settings.logoUrl || '/og-default.jpg'} />
        <meta property="og:type" content="website" />
      </Helmet>
       <section className="py-24 px-4 bg-transparent text-white min-h-[80vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h1 className="text-4xl md:text-5xl font-display font-black mb-6 uppercase tracking-tight text-shadow-sm">Struktur Pengurus</h1>
              <div className="w-24 h-1 bg-red-600 mx-auto rounded-full mb-6 filter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
              <p className="text-slate-400 font-light max-w-2xl mx-auto text-lg">Mengenal lebih dekat para pengurus yang berdedikasi tinggi di balik setiap program dan kegiatan organisasi.</p>
            </div>
            
            {isLoading ? (
               <div className="space-y-20">
                 {[1, 2].map((i) => (
                   <div key={i} className="bg-slate-900/50 rounded-[2rem] p-8 md:p-14 border border-white/5 backdrop-blur-md shadow-2xl">
                     <div className="text-center mb-10">
                        <Skeleton className="h-10 w-48 rounded-full inline-block bg-slate-800" />
                     </div>
                     <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                       {[1, 2, 3].map((j) => (
                         <div key={j} className="text-center w-40 md:w-56">
                            <Skeleton className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] mx-auto bg-slate-800 mb-6" />
                            <Skeleton className="h-6 w-3/4 mx-auto bg-slate-800" />
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            ) : boardByRole.length > 0 ? (
               <div className="space-y-20">
                 {boardByRole.map((group, idx) => (
                   <div key={idx} className="bg-slate-900/50 rounded-[2rem] p-8 md:p-14 border border-white/5 backdrop-blur-md shadow-2xl">
                     <div className="text-center mb-12">
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm inline-block shadow-[0_0_20px_rgba(220,38,38,0.1)]">
                           {group.role}
                        </span>
                     </div>
                     <div className="flex flex-wrap justify-center gap-10 md:gap-20">
                       {group.members.map((member) => (
                         <div key={member.id} className="text-center group w-40 md:w-56">
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full md:rounded-[2.5rem] mx-auto bg-slate-900 overflow-hidden mb-6 border-4 border-slate-800 group-hover:border-red-500/50 transition-all duration-500 shadow-xl group-hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] group-hover:-translate-y-2 relative">
                               {member.imageUrl ? (
                                 <img loading="lazy" src={member.imageUrl} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-900 group-hover:text-red-500/50 transition-colors">
                                   <User size={64} opacity={0.5}/>
                                 </div>
                               )}
                               <div className="absolute inset-0 ring-inset ring-2 ring-white/5 rounded-full md:rounded-[2.5rem]"></div>
                            </div>
                            <h2 className="font-display font-bold text-lg md:text-xl mb-1 uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">{member.name}</h2>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
               <div className="text-center text-slate-400 py-16 bg-slate-900/50 rounded-[2rem] border border-slate-800 border-dashed backdrop-blur-md font-light">Belum ada data kepengurusan.</div>
            )}
          </div>
       </section>
    </Layout>
  );
}
