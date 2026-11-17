import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Navigation from './Navigation.jsx'

vi.mock('../auth/useAuth.js', () => ({ default: () => ({ user: null }) }))
vi.mock('../auth/useLogout.js', () => ({ default: () => vi.fn() }))

describe('Navigation mobile menu', () => {
  it('opens the primary navigation and closes it after following a link', () => {
    const { container } = render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    )

    const toggle = screen.getByRole('button', { name: 'Abrir menu' })
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('.main-navigation')?.classList.contains('is-mobile-open')).toBe(true)

    fireEvent.click(screen.getByRole('link', { name: 'Serviços' }))
    expect(screen.getByRole('button', { name: 'Abrir menu' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('closes on Escape and returns focus to the menu button', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    )

    const toggle = screen.getByRole('button', { name: 'Abrir menu' })
    fireEvent.click(toggle)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle)
  })
})
