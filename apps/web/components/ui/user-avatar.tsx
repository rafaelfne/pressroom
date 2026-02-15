'use client';

import { getInitials, getAvatarColor } from '@/lib/utils/user-utils';
import { cn } from '@/lib/utils';

export type UserAvatarProps = {
  name: string | null | undefined;
  identifier: string | null | undefined;
  size?: 'sm' | 'md';
  className?: string;
};

export function UserAvatar({ name, identifier, size = 'md', className }: UserAvatarProps) {
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(identifier);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white',
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor }}
      data-testid="user-avatar"
    >
      {initials}
    </div>
  );
}
