import React from 'react';

export function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 ${className || ''}`}
      {...props}
    />
  );
}

