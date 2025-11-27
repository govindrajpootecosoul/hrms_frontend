'use client';

import { useEffect, useRef } from 'react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';

/**
 * ListView
 *
 * A highly–customisable list block for "activity" or "timeline" style content.
 *
 * Props:
 * - title: main section title (e.g. "People Pulse")
 * - subtitle: optional description text under the title
 * - items: array of {
 *     id?: string|number;
 *     title: string;           // main line of the item
 *     description?: string;    // secondary line
 *     date?: string;           // right–aligned text, e.g. "Jan 15"
 *     tag?: {
 *       label: string;
 *       variant?: 'success'|'warning'|'danger'|'info';
     };
 *   }
 * - scrollable: whether the list body should be scrollable
 * - maxHeight: max height when scrollable is true
 * - autoScroll: whether to auto–scroll the list vertically
 * - autoScrollSpeed: interval in ms for auto–scroll steps
 */
const getTagVariant = (label = '') => {
  const normalized = label.toLowerCase();

  if (normalized.includes('new hire')) return 'newHire';
  if (normalized.includes('leave approved')) return 'leaveApproved';
  if (normalized.includes('promotion')) return 'promotion';
  if (normalized.includes('department change')) return 'departmentChange';
  if (normalized.includes('interview')) return 'interview';
  if (normalized.includes('training')) return 'training';
  if (normalized.includes('meeting')) return 'meeting';
  if (normalized.includes('workshop')) return 'workshop';
  if (normalized.includes('festival')) return 'festival';
  if (normalized === 'leave' || normalized.includes(' leave')) return 'leave';
  if (normalized.includes('anniversary')) return 'anniversary';

  return 'default';
};

const ListView = ({
  title = 'People Pulse',
  subtitle = 'Latest movements across the organization',
  items = [],
  scrollable = false,
  maxHeight = 320,
  autoScroll = false,
  autoScrollSpeed = 40,
  className = ''
}) => {
  const scrollRef = useRef(null);

  // Simple auto-scroll behaviour for long lists.
  useEffect(() => {
    if (!autoScroll || !scrollable) return;

    const container = scrollRef.current;
    if (!container) return;

    let animationFrame;

    const step = () => {
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if (atBottom) {
        container.scrollTop = 0;
      } else {
        container.scrollTop = scrollTop + 1;
      }

      animationFrame = window.setTimeout(step, autoScrollSpeed);
    };

    animationFrame = window.setTimeout(step, autoScrollSpeed);

    return () => {
      if (animationFrame) {
        window.clearTimeout(animationFrame);
      }
    };
  }, [autoScroll, autoScrollSpeed, scrollable]);

  const bodyWrapperProps = scrollable
    ? {
        ref: scrollRef,
        style: { maxHeight, overflowY: 'auto' }
      }
    : {};

  return (
    <Card className={`p-6 w-full ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full bg-primary-500/10 border border-primary-500/40" />
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs md:text-sm text-neutral-600">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* List body */}
      <div
        {...bodyWrapperProps}
        className={`space-y-2 -mx-2 px-2 ${
          scrollable ? 'custom-scrollbar' : ''
        }`}
      >
        {items.map((item, index) => (
          <div
            key={item.id ?? index}
            className="group flex items-stretch justify-between rounded-xl border border-neutral-200 bg-white hover:border-primary-200 hover:bg-primary-50/40 transition-all duration-200 shadow-sm"
          >
            {/* Left content */}
            <div className="flex-1 px-4 py-3 md:py-4">
              <div className="flex items-center gap-3 mb-1">
                {item.tag?.label && (
                  <Badge
                    size="sm"
                    variant={getTagVariant(item.tag.label)}
                    className="uppercase tracking-wide leading-tight min-w-[96px] justify-center text-center flex-col"
                  >
                    {item.tag.label}
                  </Badge>
                )}
                <p className="text-sm font-medium text-neutral-900">
                  {item.title}
                </p>
              </div>
              {item.description && (
                <p className="text-xs md:text-sm text-neutral-600">
                  {item.description}
                </p>
              )}
            </div>

            {/* Right date */}
            {item.date && (
              <div className="px-4 py-3 md:py-4 flex items-center justify-end border-l border-neutral-100 min-w-[72px]">
                <span className="text-xs font-medium text-neutral-500">
                  {item.date}
                </span>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-neutral-500">
            No items to display.
          </div>
        )}
      </div>
    </Card>
  );
};

export default ListView;


