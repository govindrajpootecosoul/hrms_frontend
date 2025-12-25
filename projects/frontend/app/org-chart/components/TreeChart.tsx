'use client';

import { useState, useCallback } from 'react';
import { User, ChevronDown, ChevronRight } from 'lucide-react';
import { Tree, TreeNode } from 'react-organizational-chart';

interface TreeNode {
  id: string;
  name: string;
  role: string;
  level: number;
  children?: TreeNode[];
}

interface TreeChartProps {
  data: TreeNode;
}

const LEVEL_COLORS: Record<number, { border: string; bg: string; label: string; text: string }> = {
  0: { border: '#ec4899', bg: '#fce7f3', label: '#ec4899', text: '#ffffff' }, // Pink - CEO
  1: { border: '#f97316', bg: '#fff7ed', label: '#f97316', text: '#ffffff' }, // Orange - Managers
  2: { border: '#10b981', bg: '#d1fae5', label: '#10b981', text: '#ffffff' }, // Green - Directors/Foremen
  3: { border: '#3b82f6', bg: '#dbeafe', label: '#3b82f6', text: '#ffffff' }, // Blue - Workers/Managers
};

// Custom Node Component with modern styling and expand/collapse functionality
const NodeComponent = ({ 
  node, 
  level = 0, 
  isExpanded = false, 
  hasChildren = false,
  onToggle 
}: { 
  node: TreeNode; 
  level?: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
}) => {
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS[3];
  
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        style={{ minWidth: '180px' }}
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren && onToggle) {
            onToggle();
          }
        }}
      >
        {/* Avatar Circle with border */}
        <div className="flex justify-center mb-3 relative">
          <div
            className="relative rounded-full p-1 shadow-lg transition-all duration-300 group-hover:shadow-xl"
            style={{
              border: `4px solid ${colors.border}`,
              backgroundColor: 'white',
            }}
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: '70px',
                height: '70px',
                backgroundColor: colors.bg,
              }}
            >
              <User
                className="h-8 w-8 transition-colors duration-300"
                style={{ color: colors.border }}
              />
            </div>
          </div>
          
          {/* Expand/Collapse Indicator */}
          {hasChildren && (
            <div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full p-1 shadow-md border-2 border-gray-300 z-10 transition-all duration-300 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggle) {
                  onToggle();
                }
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-700" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-700" />
              )}
            </div>
          )}
        </div>

        {/* Label Card */}
        <div
          className="rounded-lg px-4 py-3 shadow-md transition-all duration-300 group-hover:shadow-xl"
          style={{
            backgroundColor: colors.label,
            minWidth: '180px',
          }}
        >
          <p
            className="text-center font-semibold text-sm mb-1 truncate"
            style={{ color: colors.text }}
          >
            {node.name}
          </p>
          <p
            className="text-center text-xs font-normal truncate"
            style={{ color: colors.text, opacity: 0.95 }}
          >
            ({node.role})
          </p>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style={{ backgroundColor: colors.border }} />
      </div>
    </div>
  );
};

// Recursive component to render tree nodes with expand/collapse
const RenderTreeNode = ({ 
  node, 
  level = 0,
  expandedNodes,
  onToggleNode
}: { 
  node: TreeNode; 
  level?: number;
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  
  const nodeLabel = (
    <NodeComponent 
      node={node} 
      level={level}
      isExpanded={isExpanded}
      hasChildren={hasChildren}
      onToggle={() => onToggleNode(node.id)}
    />
  );

  if (!hasChildren) {
    return <TreeNode label={nodeLabel} />;
  }

  // Only render children if node is expanded
  return (
    <TreeNode label={nodeLabel}>
      {isExpanded && node.children?.map((child) => (
        <RenderTreeNode 
          key={child.id} 
          node={child} 
          level={level + 1}
          expandedNodes={expandedNodes}
          onToggleNode={onToggleNode}
        />
      ))}
    </TreeNode>
  );
};

export default function TreeChart({ data }: TreeChartProps) {
  // State to track expanded nodes - CEO is expanded by default
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([data.id]));

  const handleToggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
        // Also collapse all children recursively
        const collapseChildren = (node: TreeNode) => {
          if (node.children) {
            node.children.forEach((child) => {
              newSet.delete(child.id);
              collapseChildren(child);
            });
          }
        };
        const findNode = (node: TreeNode, id: string): TreeNode | null => {
          if (node.id === id) return node;
          if (node.children) {
            for (const child of node.children) {
              const found = findNode(child, id);
              if (found) return found;
            }
          }
          return null;
        };
        const nodeToCollapse = findNode(data, nodeId);
        if (nodeToCollapse) {
          collapseChildren(nodeToCollapse);
        }
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, [data]);

  const hasChildren = data.children && data.children.length > 0;
  const isExpanded = expandedNodes.has(data.id);

  return (
    <div className="w-full overflow-auto bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 p-8 rounded-lg min-h-[600px]">
      <div className="flex justify-center">
        <Tree
          lineWidth="2px"
          lineColor="#9ca3af"
          lineBorderRadius="10px"
          nodePadding="20px"
          lineHeight="60px"
          lineStyle="dashed"
          label={
            <NodeComponent 
              node={data} 
              level={0}
              isExpanded={isExpanded}
              hasChildren={hasChildren}
              onToggle={() => handleToggleNode(data.id)}
            />
          }
        >
          {isExpanded && hasChildren && data.children?.map((child) => (
            <RenderTreeNode 
              key={child.id} 
              node={child} 
              level={1}
              expandedNodes={expandedNodes}
              onToggleNode={handleToggleNode}
            />
          ))}
        </Tree>
      </div>
    </div>
  );
}

