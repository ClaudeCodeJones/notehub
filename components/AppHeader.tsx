'use client'

import Image from 'next/image'

interface AppHeaderProps {
  leftContent?: React.ReactNode
  children?: React.ReactNode
}

export function AppHeader({ leftContent, children }: AppHeaderProps) {
  return (
    <div className="h-16 flex items-center flex-shrink-0 bg-[var(--color-accent)] shadow-sm px-4 sm:px-6 justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {leftContent}
        <Image
          src="/notehub_logo_whit.png"
          alt="NoteHUB"
          width={700}
          height={200}
          quality={100}
          className="h-8 w-auto"
          priority
        />
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}
