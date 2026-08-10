import React, { useState, useEffect } from 'react';
import { Card, Button, SearchInput, SkeletonCard, EmptyState, Badge } from '@/components/ui';
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
      <Card className="shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Study Materials</h2>
            <p className="text-slate-500 text-sm mt-1">Access notes, previous papers, and video lectures</p>
          </div>
          <div className="w-full md:w-64">
            <SearchInput 
              placeholder="Search subject or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          {['All', 'Notes', 'PDFs', 'Video', 'Paper', 'PPT'].map(f => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="rounded-full whitespace-nowrap"
            >
              {f}
            </Button>
          ))}
        </div>
      </Card>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pb-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 3}).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(mat => (
              <motion.div variants={itemVariants} key={mat.id}>
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${getBadgeColor(mat.material_type)} bg-opacity-50 dark:bg-opacity-20`}>
                      {getIcon(mat.material_type)}
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded-md ${getBadgeColor(mat.material_type)}`}>
                      {mat.material_type}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1 group-hover:text-[#862fe7] transition-colors line-clamp-2">{mat.title}</h3>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{mat.subject}</span>
                    <span>•</span>
                    <span>{new Date(mat.created_at).toLocaleDateString()}</span>
                  </div>
                  {mat.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{mat.description}</p>}
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{mat.download_count} Downloads</span>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await api.post(`/study-materials/${mat.id}/download`);
                          setMaterials(prev => prev.map(m => m.id === mat.id ? { ...m, download_count: m.download_count + 1 } : m));
                          window.open(mat.file_url || '#', '_blank');
                        } catch (err) {
                          toast.error('Download failed');
                        }
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <EmptyState icon={<Archive size={64} />} title="No materials found" message="Try adjusting your filters or check back later." />
          </div>
        )}
      </div>
    </div>
  );
}
