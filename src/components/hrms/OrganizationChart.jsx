'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Card from '@/components/common/Card';
import { mockOrgChart } from '@/lib/utils/hrmsMockData';

// react-organizational-chart relies on document at import time.
// Use dynamic import with ssr: false to avoid running it on the server.
const Tree = dynamic(
  () => import('react-organizational-chart').then(mod => mod.Tree),
  { ssr: false }
);

const TreeNode = dynamic(
  () => import('react-organizational-chart').then(mod => mod.TreeNode),
  { ssr: false }
);

const OrgNode = ({ title, subtitle, color, isCollapsed, onToggle }) => {
  const bg = color || 'from-primary-500 to-primary-600';
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex min-w-[200px] max-w-xs items-stretch text-left focus:outline-none"
    >
      <Card
        className={`flex-1 flex items-center justify-between px-4 py-3 bg-gradient-to-r ${bg} text-white border-none shadow-md hover:shadow-lg transition-shadow duration-200`}
      >
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          {subtitle && (
            <p className="text-xs text-white/80 line-clamp-2">{subtitle}</p>
          )}
        </div>
        <div className="ml-3 flex items-center justify-center rounded-full bg-white/10 w-7 h-7">
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white" />
          )}
        </div>
      </Card>
    </button>
  );
};

const OrganizationChart = () => {
  // Track which nodes are collapsed; by default nothing is collapsed
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());

  const toggleNode = useCallback((id) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const renderNode = (node) => {
    const isCollapsed = collapsedNodes.has(node.id);

    const label = (
      <OrgNode
        title={node.title}
        subtitle={node.subtitle}
        color={node.color}
        isCollapsed={isCollapsed}
        onToggle={() => toggleNode(node.id)}
      />
    );

    if (!node.children || node.children.length === 0) {
      return <TreeNode key={node.id} label={label} />;
    }

    return (
      <TreeNode key={node.id} label={label}>
        {!isCollapsed &&
          node.children.map((child) => {
            return renderNode(child);
          })}
      </TreeNode>
    );
  };

  return (
    <div className="w-full overflow-x-auto py-6">
      <Tree
        lineWidth={'2px'}
        lineColor={'#e5e7eb'}
        lineBorderRadius={'8px'}
        label={renderNode(mockOrgChart).props.label}
      >
        {/* Children of root */}
        {!collapsedNodes.has(mockOrgChart.id) &&
          mockOrgChart.children?.map((child) => renderNode(child))}
      </Tree>
    </div>
  );
};

export default OrganizationChart;


