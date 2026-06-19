import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, Book, Archive, Download, Search, Filter, Loader2, PlayCircle } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export function StudentMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get('/study-materials');
        setMaterials(res.data.materials || []);
      } catch (err) {
        toast.error('Failed to load study materials');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="w-8 h-8 text-rose-500" />;
      case 'video': return <Video className="w-8 h-8 text-blue-500" />;
      case 'notes': return <Book className="w-8 h-8 text-emerald-500" />;
      case 'paper': return <Archive className="w-8 h-8 text-purple-500" />;
      case 'ppt': return <PlayCircle className="w-8 h-8 text-orange-500" />;
      default: return <FileText className="w-8 h-8 text-slate-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30';
      case 'video': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30';
      case 'notes': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30';
      case 'paper': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30';
      case 'ppt': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800';
    }
  };

  const filtered = materials.filter(m => {
    const matchesFilter = filter === 'All' || m.material_type.toLowerCase() === filter.toLowerCase() || (filter === 'PDFs' && m.material_type === 'pdf');
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      {/* Header & Search */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Study Materials</h2>
            <p className="text-slate-500 text-sm mt-1">Access notes, previous papers, and video lectures</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search subject or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#0EA5A4]/50 focus:border-[#0EA5A4] transition-all outline-none text-sm dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          {['All', 'Notes', 'PDFs', 'Video', 'Paper', 'PPT'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${filter === f ? 'bg-gradient-to-r from-[#0EA5A4] to-[#14B8A6] text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pb-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 text-[#0EA5A4] animate-spin" /></div>
        ) : filtered.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(mat => (
              <motion.div variants={itemVariants} key={mat.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${getBadgeColor(mat.material_type)} bg-opacity-50 dark:bg-opacity-20`}>
                    {getIcon(mat.material_type)}
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold uppercase rounded-md ${getBadgeColor(mat.material_type)}`}>
                    {mat.material_type}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1 group-hover:text-[#0EA5A4] transition-colors line-clamp-2">{mat.title}</h3>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
                  <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{mat.subject}</span>
                  <span>•</span>
                  <span>{new Date(mat.created_at).toLocaleDateString()}</span>
                </div>
                {mat.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{mat.description}</p>}
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{mat.download_count} Downloads</span>
                  <button 
                    onClick={async () => {
                      try {
                        await api.post(`/study-materials/${mat.id}/download`);
                        setMaterials(prev => prev.map(m => m.id === mat.id ? { ...m, download_count: m.download_count + 1 } : m));
                        window.open(mat.file_url || '#', '_blank');
                      } catch (err) {
                        toast.error('Download failed');
                      }
                    }}
                    className="flex items-center gap-1.5 text-sm font-bold text-[#0EA5A4] hover:text-[#14B8A6] bg-[#0EA5A4]/10 hover:bg-[#0EA5A4]/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <Archive size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No materials found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
