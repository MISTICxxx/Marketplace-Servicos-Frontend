import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import QuoteComposer from './QuoteComposer.jsx'
import { toCents } from '../../utils/quoteFormatting.js'

function fillQuote(title = 'Opção econômica') {
  if (screen.queryByLabelText('Nome da alternativa')) {
    fireEvent.change(screen.getByLabelText('Nome da alternativa'), { target: { value: title } })
  }
  fireEvent.change(screen.getByLabelText('Valor total (R$)'), { target: { value: '245,90' } })
  fireEvent.change(screen.getByLabelText('Descrição do serviço'), { target: { value: 'Instalação e revisão dos pontos solicitados.' } })
  fireEvent.change(screen.getByLabelText('Itens incluídos, um por linha'), { target: { value: 'Mão de obra\nTeste de segurança' } })
  fireEvent.change(screen.getByLabelText('Itens não incluídos, um por linha'), { target: { value: 'Pintura' } })
  fireEvent.change(screen.getByLabelText('Prazo estimado em dias'), { target: { value: '2' } })
  fireEvent.change(screen.getByLabelText('Condições'), { target: { value: 'Peças extras serão combinadas antes.' } })
}

describe('QuoteComposer', () => {
  it('converte valor em centavos sem ponto flutuante', () => {
    expect(toCents('245,90')).toBe(24590)
    expect(toCents('0,01')).toBe(1)
    expect(toCents('0')).toBeNull()
    expect(toCents('12,999')).toBeNull()
  })

  it('envia alternativa estruturada com valor exato e mantém erros da API no formulário', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('A solicitação não está aberta.'))
    render(<QuoteComposer conversationId="conversation-1" onSubmit={onSubmit} />)
    fillQuote()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar orçamento' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      title: 'Opção econômica',
      amountCents: 24590,
      description: 'Instalação e revisão dos pontos solicitados.',
      includedItems: ['Mão de obra', 'Teste de segurança'],
      excludedItems: ['Pintura'],
      estimatedDays: 2,
      conditions: 'Peças extras serão combinadas antes.',
      validUntil: null,
    }, undefined, 'conversation-1'))
    expect((await screen.findByRole('alert')).textContent).toContain('A solicitação não está aberta.')
  })

  it('revisa uma identidade existente sem enviar novo título nem sobrescrever a versão antiga', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const quote = { id: 'quote-1', title: 'Opção completa', currentVersion: { amountCents: 40000, description: 'Montagem completa e nivelamento do móvel.', includedItems: ['Montagem'], excludedItems: [], estimatedDays: 1, conditions: 'Manual disponível.' } }
    render(<QuoteComposer conversationId="conversation-1" onSubmit={onSubmit} quote={quote} />)
    expect(screen.queryByLabelText('Nome da alternativa')).toBeNull()
    fireEvent.change(screen.getByLabelText('Valor total (R$)'), { target: { value: '420,00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar nova versão' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ amountCents: 42000 }), 'quote-1', 'conversation-1'))
  })
})
