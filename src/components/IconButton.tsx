// Copyright © 2026 JalapenoLabs

import type { ReactNode } from 'react'

type Props = {
  label: string
  onClick: () => void
  isActive?: boolean
  children: ReactNode
}

/** Icon-only control. The label doubles as the tooltip and the accessible name. */
export function IconButton(props: Props) {
  return <button
    type='button'
    className='icon-button'
    title={props.label}
    aria-label={props.label}
    aria-pressed={props.isActive}
    style={props.isActive ? { color: 'var(--color-accent)' } : undefined}
    onClick={props.onClick}
  >{
    props.children
  }</button>
}
