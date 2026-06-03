'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CategoryIcon({ name, className = "h-5 w-5", style }: CategoryIconProps) {
  // Access the icon dynamically from the Lucide exports
  const IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    // Return a default fallback icon if the specified name is invalid
    const FallbackIcon = LucideIcons.HelpCircle;
    return <FallbackIcon className={className} style={style} />;
  }

  return <IconComponent className={className} style={style} />;
}
