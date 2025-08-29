import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, FileText, ExternalLink, Book, Users, Wrench, Package, AlertCircle, Settings, Link } from 'lucide-react';

interface ReferenceDocument {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  category: 'workflow' | 'technical' | 'training' | 'policy';
  isExternal?: boolean;
}

const referenceDocuments: ReferenceDocument[] = [
  {
    id: 'decisiv-portal',
    title: 'Decisiv Portal',
    description: 'Access Decisiv case management system',
    url: 'https://paccar.decisiv.net/',
    icon: <ExternalLink size={16} />,
    category: 'workflow',
    isExternal: true
  },
  {
    id: 'vision-dashboards',
    title: 'Vision - Decisiv Dashboards',
    description: 'Advanced analytics and reporting dashboards',
    url: 'https://vision.decisivapps.com/',
    icon: <Package size={16} />,
    category: 'technical',
    isExternal: true
  },
  {
    id: 'canto-scorecard',
    title: 'Canto - Dealer Scorecard',
    description: 'Dealer scorecard documents and resources',
    url: 'https://kenworth.canto.com/w/WichitaKenworth/album/SVDGV?display=curatedView&viewIndex=1&referenceTo=&from=thumbnail',
    icon: <Wrench size={16} />,
    category: 'technical',
    isExternal: true
  },
  {
    id: 'decisiv-training-portal',
    title: 'Decisiv Training Portal',
    description: 'Decisiv system training courses and certifications',
    url: 'https://bca-training.net/kenworthdealertraining/launchseries/56D55CDB-8CE5-44F3-9BC6-BF60D21459F4',
    icon: <Users size={16} />,
    category: 'training',
    isExternal: true
  },
  {
    id: 'workflow-guide',
    title: 'Service Workflow Guide',
    description: 'Complete workflow procedures and best practices',
    url: '/metrics/definitions',
    icon: <Book size={16} />,
    category: 'workflow'
  },
  // Removed Safety Procedures and Quality Standards
];

const categoryColors = {
  workflow: 'from-blue-500 to-blue-600',
  technical: 'from-green-500 to-green-600',
  training: 'from-purple-500 to-purple-600',
  policy: 'from-orange-500 to-orange-600'
};

const categoryLabels = {
  workflow: 'Workflow',
  technical: 'Technical',
  training: 'Training',
  policy: 'Policy'
};

export default function QuickLinksPanel() {
  const [isExpanded, setIsExpanded] = useState(false); // Changed to false for collapsed by default
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredDocuments = selectedCategory === 'all'
    ? referenceDocuments
    : referenceDocuments.filter(doc => doc.category === selectedCategory);

  const handleDocumentClick = (doc: ReferenceDocument) => {
    if (doc.isExternal) {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = doc.url;
    }
  };

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 xl:p-3 flex items-center justify-center hover:bg-slate-700/50 transition-colors duration-200 relative"
        aria-label={isExpanded ? 'Minimize Quick Links' : 'Expand Quick Links'}
      >
        {isExpanded ? (
          <ChevronRight className="w-4 h-4 xl:w-5 xl:h-5 text-slate-300" />
        ) : (
          <div className="flex flex-col items-center space-y-1">
            <Link className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400 animate-bounce" />
            <div className="flex items-center">
              <ChevronLeft className="w-3 h-3 xl:w-4 xl:h-4 text-slate-300" />
            </div>
          </div>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
  <div className="w-180 xl:w-96 p-3 xl:p-4 animate-slide-in-mobile">
          <div className="mb-3 xl:mb-4">
            <h3 className="text-base xl:text-lg font-bold text-white mb-1 xl:mb-2 flex items-center">
              <FileText className="w-4 h-4 xl:w-5 xl:h-5 mr-2 text-red-400" />
              Quick Links
            </h3>
            <p className="text-xs text-slate-400">Reference Documents & Tools</p>
          </div>

          {/* Category Filter */}
          <div className="mb-3 xl:mb-4">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-1 text-xs rounded-md font-medium transition-colors duration-200 ${
                  selectedCategory === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All
              </button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-colors duration-200 ${
                    selectedCategory === key
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Document Links */}
          <div className="space-y-2 max-h-80 xl:max-h-96 overflow-y-auto">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc: ReferenceDocument) => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc)}
                  className="w-full p-2 xl:p-3 text-left bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all duration-200 hover:scale-105 group border border-slate-700/50 hover:border-slate-600"
                >
                  <div className="flex items-start space-x-2 xl:space-x-3">
                    <div className={`p-1.5 xl:p-2 rounded-md bg-gradient-to-r ${categoryColors[doc.category]} text-white flex-shrink-0`}>
                      {doc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <h4 className="text-xs xl:text-sm font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                          {doc.title}
                        </h4>
                        {doc.isExternal && (
                          <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No documents found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center">
              {filteredDocuments.length} reference{filteredDocuments.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
