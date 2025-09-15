import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

// 自定义组件用于更好的样式控制
const MarkdownComponents = {
  // 代码块
  code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4 text-sm">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code 
        className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" 
        {...props}
      >
        {children}
      </code>
    );
  },
  
  // 引用块
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">
      {children}
    </blockquote>
  ),
  
  // 表格
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300 text-sm">
        {children}
      </table>
    </div>
  ),
  
  thead: ({ children }) => (
    <thead className="bg-gray-100">
      {children}
    </thead>
  ),
  
  th: ({ children }) => (
    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">
      {children}
    </th>
  ),
  
  td: ({ children }) => (
    <td className="border border-gray-300 px-3 py-2 text-gray-700">
      {children}
    </td>
  ),
  
  // 标题
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 border-b-2 border-gray-200 pb-2">
      {children}
    </h1>
  ),
  
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3 border-b border-gray-200 pb-1">
      {children}
    </h2>
  ),
  
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
      {children}
    </h3>
  ),
  
  // 列表
  ul: ({ children }) => (
    <ul className="list-disc list-inside my-3 space-y-1 text-gray-700">
      {children}
    </ul>
  ),
  
  ol: ({ children }) => (
    <ol className="list-decimal list-inside my-3 space-y-1 text-gray-700">
      {children}
    </ol>
  ),
  
  li: ({ children }) => (
    <li className="ml-2">
      {children}
    </li>
  ),
  
  // 链接
  a: ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  ),
  
  // 段落
  p: ({ children }) => (
    <p className="my-2 text-gray-700 leading-relaxed">
      {children}
    </p>
  ),
  
  // 强调
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">
      {children}
    </strong>
  ),
  
  em: ({ children }) => (
    <em className="italic text-gray-700">
      {children}
    </em>
  ),
  
  // 删除线
  del: ({ children }) => (
    <del className="line-through text-gray-500">
      {children}
    </del>
  ),
  
  // 水平分割线
  hr: () => (
    <hr className="my-6 border-t-2 border-gray-200" />
  )
};

const EnhancedMarkdown = ({ 
  content, 
  className = '', 
  isUserMessage = false 
}) => {
  return (
    <div className={`prose prose-sm max-w-none ${isUserMessage ? 'prose-invert' : ''} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={MarkdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default EnhancedMarkdown;