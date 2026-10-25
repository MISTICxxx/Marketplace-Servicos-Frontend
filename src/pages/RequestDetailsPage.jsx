import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import useAuth from '../auth/useAuth.js'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import RequestForm from '../components/requests/RequestForm.jsx'
import requestService from '../services/requestService.js'
import { formatDesiredDate, formatRequestBudget, formatRequestDate, getCategoryName, statusLabels } from '../utils/requestFormatting.js'

function loadRequest(ownerId, requestId) {
  try {
    return { request: requestService.getById(ownerId, requestId), error: '' }
  } catch (error) {
    return { request: null, error: error.message || 'Não foi possível ler a solicitação local.' }
  }
}

function getEventLabel(event) {
  if (event === 'created') return 'Pedido criado'
  if (event === 'edited') return 'Pedido atualizado'
  if (event === 'cancelled') return 'Pedido cancelado'
  return 'Atualização'
}

function RequestDetailsPage() {
  const { requestId } = useParams()
  const { user } = useAuth()
  const location = useLocation()
  const [result, setResult] = useState(() => loadRequest(user.id, requestId))
  const [editing, setEditing] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice ?? '')
  const dialogRef = useRef(null)
  const request = result.request

  useEffect(() => {
    const dialog = dialogRef.current
    if (confirmCancel && dialog && !dialog.open) {
      dialog.showModal()
    }
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [confirmCancel])

  function handleEditSaved(updatedRequest) {
    if (!updatedRequest) {
      setEditing(false)
      return
    }
    setResult({ request: updatedRequest, error: '' })
    setEditing(false)
    setNotice('Alterações salvas neste navegador.')
  }

  function handleCancelRequest() {
    try {
      const cancelled = requestService.cancel(user.id, request.id)
      setResult({ request: cancelled, error: '' })
    setNotice('Pedido cancelado. Os dados e o histórico foram mantidos.')
      setActionError('')
      setConfirmCancel(false)
    } catch (error) {
      setActionError(error.message || 'Não foi possível cancelar a solicitação.')
    }
  }

  if (result.error) {
    return (
      <section className="page-section page-container request-detail-page">
        <div className="empty-state" role="alert">
          <h1>Não foi possível abrir a solicitação</h1>
          <p>{result.error}</p>
          <Link className="button button--secondary" to="/meus-pedidos">Voltar aos meus pedidos</Link>
        </div>
      </section>
    )
  }

  if (!request) {
    return (
      <section className="page-section page-container request-detail-page">
        <div className="empty-state" role="status">
          <span aria-hidden="true" className="empty-state-mark">?</span>
          <h1>Solicitação não encontrada</h1>
          <p>Ela pode não existir ou não pertencer à sua conta.</p>
          <Link className="button button--primary" to="/meus-pedidos">Voltar aos meus pedidos</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section page-container request-detail-page">
      <p className="request-back-link"><Link className="text-link" to="/meus-pedidos">← Meus pedidos</Link></p>
      {notice && <p className="form-message form-message--info" role="status">{notice}</p>}
      {actionError && <p className="form-message form-message--error" role="alert">{actionError}</p>}

      <header className="request-detail-heading">
        <div>
          <p className="eyebrow">Solicitação · {getCategoryName(request.categoryId)}</p>
          <h1>{request.title}</h1>
          <p className="request-detail-subtitle">Criada em {formatRequestDate(request.createdAt, true)}</p>
        </div>
        <span className={`request-status request-status--${request.status}`}>{statusLabels[request.status]}</span>
      </header>

      {editing ? (
        <RequestForm mode="edit" onSaved={handleEditSaved} request={request} />
      ) : (
        <div className="request-detail-layout">
          <div className="request-detail-main">
            <Card className="request-detail-card request-description-card">
              <p className="request-section-kicker">Descrição do serviço</p>
              <h2>O que precisa ser feito</h2>
              <p className="request-detail-description">{request.description}</p>
            </Card>

            <Card className="request-detail-card">
              <p className="request-section-kicker">Contexto</p>
              <h2>Local e disponibilidade</h2>
              <dl className="request-summary-list request-detail-facts">
                <div><dt>Categoria</dt><dd>{getCategoryName(request.categoryId)}</dd></div>
                <div><dt>Cidade e região</dt><dd>{[request.city, request.region].filter(Boolean).join(', ')}</dd></div>
                <div><dt>Bairro</dt><dd>{request.neighborhood || 'Não informado'}</dd></div>
                <div><dt>Data desejada</dt><dd>{formatDesiredDate(request.desiredDate)}</dd></div>
                <div><dt>Preferência de horário</dt><dd>{request.availability || 'Não informada'}</dd></div>
              </dl>
            </Card>

            <Card className="request-detail-card request-history-card">
              <p className="request-section-kicker">Registro local</p>
              <h2>Histórico do pedido</h2>
              <ol className="request-history-list">
                {request.history.map((event) => (
                  <li key={event.id}>
                    <span aria-hidden="true" className="request-history-mark" />
                    <div>
                      <strong>{getEventLabel(event.event)}</strong>
                      <p>{event.description}</p>
                      <time dateTime={event.createdAt}>{formatRequestDate(event.createdAt, true)}</time>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <aside className="request-detail-sidebar">
            <Card className="request-receipt request-detail-receipt">
              <div className="request-receipt-heading"><span>FECHOU! · RESUMO</span><span>{statusLabels[request.status]}</span></div>
              <dl className="request-summary-list">
                <div><dt>Orçamento</dt><dd>{formatRequestBudget(request)}</dd></div>
                <div><dt>Criado</dt><dd>{formatRequestDate(request.createdAt, true)}</dd></div>
                <div><dt>Atualizado</dt><dd>{formatRequestDate(request.updatedAt, true)}</dd></div>
              </dl>
              <p className="request-receipt-footnote">Salvo neste navegador · sem envio a prestadores</p>
            </Card>
            {request.status === 'open' ? (
              <div className="request-detail-actions">
                <Button onClick={() => { setNotice(''); setEditing(true) }} variant="secondary">Editar solicitação</Button>
                <Button className="button--danger" onClick={() => { setActionError(''); setConfirmCancel(true) }}>Cancelar solicitação</Button>
              </div>
            ) : (
              <p className="request-cancelled-note" role="status">Este pedido está cancelado. Ele continua disponível para consulta, mas não pode mais ser editado.</p>
            )}
          </aside>
        </div>
      )}

      <dialog
        aria-describedby="cancel-request-description"
        aria-labelledby="cancel-request-title"
        className="request-confirm-dialog"
        onCancel={(event) => { event.preventDefault(); setConfirmCancel(false) }}
        onClose={() => setConfirmCancel(false)}
        ref={dialogRef}
      >
        <p className="request-section-kicker">Confirmação</p>
        <h2 id="cancel-request-title">Cancelar esta solicitação?</h2>
        <p id="cancel-request-description">Ela deixará de estar aberta, mas seus dados e o histórico permanecerão guardados neste navegador. Esta ação não poderá ser desfeita.</p>
        {actionError && <p className="form-message form-message--error" role="alert">{actionError}</p>}
        <div className="request-form-actions">
          <Button onClick={() => { dialogRef.current?.close(); setConfirmCancel(false) }} variant="secondary">Manter aberta</Button>
          <Button className="button--danger" onClick={handleCancelRequest}>Confirmar cancelamento</Button>
        </div>
      </dialog>
    </section>
  )
}

export default RequestDetailsPage
