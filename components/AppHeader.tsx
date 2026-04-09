'use client'

import Image from 'next/image'

interface AppHeaderProps {
  children?: React.ReactNode
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <div className="h-16 flex items-center flex-shrink-0 bg-[var(--color-accent)] shadow-sm px-6 justify-between">
      <Image
        src="/notehub_newlogo_white.png"
        alt="NoteHUB"
        width={260}
        height={88}
        quality={100}
        className="h-8 w-auto"
        priority
      />
      <div>{children}</div>
    </div>
  )
}
