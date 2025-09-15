import React from 'react';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  MessageCircle, 
  PenTool, 
  BookOpen, 
  Users, 
  Globe, 
  GraduationCap 
} from 'lucide-react';

// 模式图标映射
const MODE_ICONS = {
  free_chat: MessageCircle,
  writing_enhancement: PenTool,
  grammar_focus: BookOpen,
  role_playing: Users,
  topic_discussion: Globe,
  cet_preparation: GraduationCap
};

// 模式颜色映射
const MODE_COLORS = {
  free_chat: 'bg-blue-500',
  writing_enhancement: 'bg-green-500',
  grammar_focus: 'bg-purple-500',
  role_playing: 'bg-orange-500',
  topic_discussion: 'bg-indigo-500',
  cet_preparation: 'bg-red-500'
};

// 模式名称映射
const MODE_NAMES = {
  free_chat: '自由对话',
  writing_enhancement: '写作提升',
  grammar_focus: '语法提升',
  role_playing: '角色扮演',
  topic_discussion: '主题探讨',
  cet_preparation: '四六级备考'
};

const ModeIndicator = ({ mode = 'free_chat', size = 'default', showLabel = true, className = '' }) => {
  const IconComponent = MODE_ICONS[mode] || MessageCircle;
  const colorClass = MODE_COLORS[mode] || 'bg-blue-500';
  const modeName = MODE_NAMES[mode] || '自由对话';
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const iconSize = sizeClasses[size] || sizeClasses.default;
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`p-2 rounded-lg ${colorClass} text-white flex items-center justify-center`}>
        <IconComponent className={iconSize} />
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{modeName}</span>
          <span className="text-xs text-gray-500">当前模式</span>
        </div>
      )}
    </div>
  );
};

// 简化版本，只显示图标和名称
export const SimpleModeIndicator = ({ mode = 'free_chat', className = '' }) => {
  const IconComponent = MODE_ICONS[mode] || MessageCircle;
  const colorClass = MODE_COLORS[mode] || 'bg-blue-500';
  const modeName = MODE_NAMES[mode] || '自由对话';
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`p-1 rounded ${colorClass} text-white`}>
        <IconComponent className="w-3 h-3" />
      </div>
      <span className="text-sm font-medium text-gray-700">{modeName}</span>
    </div>
  );
};

// 徽章版本
export const ModeBadge = ({ mode = 'free_chat', variant = 'default', className = '' }) => {
  const IconComponent = MODE_ICONS[mode] || MessageCircle;
  const modeName = MODE_NAMES[mode] || '自由对话';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  };
  
  const colorMap = {
    free_chat: 'blue',
    writing_enhancement: 'green',
    grammar_focus: 'purple',
    role_playing: 'orange',
    topic_discussion: 'indigo',
    cet_preparation: 'red'
  };
  
  const badgeVariant = variantClasses[colorMap[mode]] || variantClasses.default;
  
  return (
    <Badge className={`flex items-center space-x-1 px-2 py-1 border ${badgeVariant} ${className}`}>
      <IconComponent className="w-3 h-3" />
      <span className="text-xs font-medium">{modeName}</span>
    </Badge>
  );
};

export default ModeIndicator;