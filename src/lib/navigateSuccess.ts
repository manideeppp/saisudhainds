import type { NavigateFunction } from 'react-router-dom'

export function navigateAfterCreate(
  navigate: NavigateFunction,
  opts: {
    title: string
    message: string
    returnTo: string
    returnLabel?: string
    listTo?: string
    listLabel?: string
  },
) {
  navigate('/success', {
    state: {
      title: opts.title,
      message: opts.message,
      returnTo: opts.returnTo,
      returnLabel: opts.returnLabel ?? 'View list',
      listTo: opts.listTo,
      listLabel: opts.listLabel,
    },
  })
}
