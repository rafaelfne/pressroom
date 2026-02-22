'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Database } from 'lucide-react';

export interface BindingPathExplorerProps {
  sampleData?: Record<string, unknown>;
  onSelectPath: (path: string) => void;
}

type TreeNodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

interface TreeNode {
  key: string;
  value: unknown;
  type: TreeNodeType;
  path: string;
  children?: TreeNode[];
}

// Blocked properties for security
const BLOCKED_PROPS = new Set(['__proto__', 'prototype', 'constructor']);

// Get type of a value
function getValueType(value: unknown): TreeNodeType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as TreeNodeType;
}

// Get type badge color (consistent with binding-autocomplete.tsx)
function getTypeBadgeClass(type: TreeNodeType | string): string {
  if (typeof type === 'string' && type.startsWith('array')) {
    return 'bg-purple-100 text-purple-700';
  }
  switch (type) {
    case 'string':
      return 'bg-green-100 text-green-700';
    case 'number':
      return 'bg-blue-100 text-blue-700';
    case 'boolean':
      return 'bg-yellow-100 text-yellow-700';
    case 'object':
      return 'bg-gray-100 text-gray-700';
    case 'array':
      return 'bg-purple-100 text-purple-700';
    case 'null':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

// Build tree from sample data
function buildTree(
  data: Record<string, unknown>,
  parentPath = ''
): TreeNode[] {
  const nodes: TreeNode[] = [];

  for (const [key, value] of Object.entries(data)) {
    // Block dangerous properties
    if (BLOCKED_PROPS.has(key)) {
      continue;
    }

    const path = parentPath ? `${parentPath}.${key}` : key;
    const type = getValueType(value);

    const node: TreeNode = {
      key,
      value,
      type,
      path,
    };

    // Recursively build children for objects and arrays
    if (type === 'object' && value !== null) {
      node.children = buildTree(value as Record<string, unknown>, path);
    } else if (type === 'array' && Array.isArray(value)) {
      // For arrays, show first item structure if available
      const arrayChildren: TreeNode[] = [];
      if (value.length > 0) {
        const firstItem = value[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          arrayChildren.push(
            ...buildTree(firstItem as Record<string, unknown>, `${path}[0]`)
          );
        }
      }
      node.children = arrayChildren;
    }

    nodes.push(node);
  }

  return nodes;
}

// Tree node component
interface TreeNodeComponentProps {
  node: TreeNode;
  onSelectPath: (path: string) => void;
  depth: number;
}

function TreeNodeComponent({
  node,
  onSelectPath,
  depth,
}: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0); // Auto-expand first level

  const hasChildren =
    node.children && node.children.length > 0;
  const isLeaf = !hasChildren;

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleClick = () => {
    if (isLeaf) {
      onSelectPath(node.path);
    } else {
      handleToggle();
    }
  };

  const paddingLeft = depth * 16; // 16px = 4 * 4 (Tailwind spacing)

  return (
    <div data-testid="tree-node">
      <div
        className={`flex items-center gap-2 py-1.5 px-3 hover:bg-gray-50 cursor-pointer`}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
        onClick={handleClick}
        data-testid={isLeaf ? 'tree-leaf' : undefined}
      >
        {/* Expand/collapse toggle for objects and arrays */}
        {hasChildren && (
          <span className="text-gray-400 text-xs w-3">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="w-3" />}

        {/* Key name */}
        <span className="font-mono text-sm text-gray-700 font-medium">
          {node.key}
        </span>

        {/* Array item count */}
        {node.type === 'array' && Array.isArray(node.value) && (
          <span className="text-xs text-gray-500">
            → array[{node.value.length}]
          </span>
        )}

        {/* Type badge for leaf nodes */}
        {isLeaf && (
          <span
            className={`ml-auto rounded px-1.5 py-0.5 text-xs font-medium ${getTypeBadgeClass(
              node.type
            )}`}
          >
            {node.type}
          </span>
        )}
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.path}
              node={child}
              onSelectPath={onSelectPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BindingPathExplorer({
  sampleData,
  onSelectPath,
}: BindingPathExplorerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Build tree from sample data
  const tree = sampleData ? buildTree(sampleData) : [];

  // Handle path selection
  const handleSelectPath = useCallback(
    (path: string) => {
      onSelectPath(path);
      setIsOpen(false);
    },
    [onSelectPath]
  );

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const hasData = tree.length > 0;

  return (
    <div className="relative" data-testid="binding-path-explorer">
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!hasData}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
        title={hasData ? 'Browse data structure' : 'No sample data available'}
        data-testid="explorer-trigger"
      >
        <Database size={16} />
      </button>

      {/* Popover */}
      {isOpen && hasData && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-2 right-0 w-80 max-h-96 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
          data-testid="explorer-popover"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-3 py-2">
            <h3 className="text-sm font-semibold text-gray-700">
              Data Structure
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Click a field to insert its path
            </p>
          </div>

          {/* Tree */}
          <div className="py-1">
            {tree.map((node) => (
              <TreeNodeComponent
                key={node.path}
                node={node}
                onSelectPath={handleSelectPath}
                depth={0}
              />
            ))}
          </div>

          {/* Empty state */}
          {tree.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-gray-500">
              No data available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
