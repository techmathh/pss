import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Layout from '../components/ui/Layout';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../lib/useSettings';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

export default function NewsDetail() {
  const { id } = useParams();
  const { settings } = useSettings();

  const { data: news, isLoading } = useQuery<NewsItem | null>({
    queryKey: ['news', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as NewsItem;
        }
        return null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `news/${id}`);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="py-24 px-4 bg-transparent min-h-[80vh] relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent"></div>
          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <Skeleton className="h-6 w-32 bg-slate-800" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24 bg-slate-800" />
              <Skeleton className="h-16 w-3/4 bg-slate-800" />
              <Skeleton className="h-16 w-1/2 bg-slate-800" />
            </div>
            <Skeleton className="h-96 w-full rounded-3xl bg-slate-800" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-slate-800" />
              <Skeleton className="h-4 w-full bg-slate-800" />
              <Skeleton className="h-4 w-3/4 bg-slate-800" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (!news) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-[50vh] text-center px-4 relative">
          <h1 className="text-2xl font-black text-white uppercase mb-4">Berita Tidak Ditemukan</h1>
          <Link to="/berita" className="text-red-500 font-bold flex items-center gap-2 hover:underline">
            <ArrowLeft size={16} /> Kembali ke daftar berita
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{news.title} | {settings.name || 'Pencak Silat SMAN'} </title>
        <meta name="description" content={news.content.substring(0, 155) + (news.content.length > 155 ? '...' : '')} />
        <meta property="og:title" content={`${news.title} | ${settings.name}`} />
        <meta property="og:description" content={news.content.substring(0, 155) + (news.content.length > 155 ? '...' : '')} />
        <meta property="og:image" content={news.imageUrl || settings.logoUrl || '/og-default.jpg'} />
        <meta property="og:type" content="article" />
      </Helmet>
      <section className="py-24 px-4 bg-transparent min-h-[80vh] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Link to="/berita" className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm tracking-widest uppercase mb-12 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Daftar Berita
          </Link>
          
          <div className="mb-12">
            <p className="text-red-500 font-bold tracking-widest uppercase mb-4 text-sm">{news.date}</p>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-white leading-[1.1] tracking-tight mb-8">
              {news.title}
            </h1>
          </div>

          {news.imageUrl && (
            <div className="w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl mb-16 border border-white/5">
              <img loading="lazy" src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-6">
            {news.content.split('\n\n').map((para, i) => {
              const cleanedPara = para.trim();
              if (!cleanedPara) return null;
              return (
                <p key={i} className="text-slate-300 font-light leading-relaxed text-lg whitespace-pre-line">
                  {cleanedPara}
                </p>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
