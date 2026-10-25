import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../auth/useAuth.js'
import serviceCategories from '../../data/serviceCategories.js'
import requestService from '../../services/requestService.js'
import { formatDesiredDate } from '../../utils/requestFormatting.js'
import Button from '../common/Button.jsx'
import Card from '../common/Card.jsx'
import FormField from '../account/FormField.jsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

const emptyDetails = {
  title: '',
  categoryId: '',
  description: '',
  city: '',
  region: '',
  neighborhood: '',
  desiredDate: '',
  availability: '',
  budgetMin: '',
  budgetMax: '',
  prefersProposals: true,
}

function toFormValues(request) {
  if (!request) return null
  return {
    title: request.title,
    categoryId: request.categoryId,
    description: request.description,
    city: request.city,
    region: request.region,
    neighborhood: request.neighborhood ?? '',
    desiredDate: request.desiredDate ?? '',
    availability: request.availability ?? '',
    budgetMin: request.budgetMin === null || request.budgetMin === undefined ? '' : String(request.budgetMin),
    budgetMax: request.budgetMax === null || request.budgetMax === undefined ? '' : String(request.budgetMax),
    prefersProposals: request.prefersProposals,
  }
}

function createInitialValues(request, user) {
  return toFormValues(request) ?? {
    ...emptyDetails,
    city: user?.city ?? '',
    region: user?.region ?? '',
  }
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

function RequestForm({ mode = 'create', request = null, onSaved }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState(() => createInitialValues(request, user))
  const [initialValues] = useState(() => createInitialValues(request, user))
  const [step, setStep] = useState('form')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = mode === 'edit'
  const hasUnsavedChanges = isEditing && JSON.stringify(values) !== JSON.stringify(initialValues)

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined
    function warnBeforeLeaving(event) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [hasUnsavedChanges])

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  function validate() {
    const nextErrors = {}
    if (!values.title.trim()) nextErrors.title = 'Informe um resumo do serviço.'
    else if (values.title.trim().length > 100) nextErrors.title = 'Use até 100 caracteres.'
    if (!values.categoryId) nextErrors.categoryId = 'Escolha uma categoria.'
    if (!values.description.trim()) nextErrors.description = 'Descreva o que você precisa.'
    else if (values.description.trim().length < 20) nextErrors.description = 'Conte um pouco mais (mínimo de 20 caracteres).'
    else if (values.description.trim().length > 2000) nextErrors.description = 'Use até 2.000 caracteres.'
    if (!values.city.trim()) nextErrors.city = 'Informe a cidade.'
    else if (values.city.trim().length > 80) nextErrors.city = 'Use até 80 caracteres.'
    if (!values.region.trim()) nextErrors.region = 'Informe o estado ou região.'
    else if (values.region.trim().length > 40) nextErrors.region = 'Use até 40 caracteres.'
    if (values.neighborhood.trim().length > 80) nextErrors.neighborhood = 'Use até 80 caracteres.'
    if (values.availability.trim().length > 120) nextErrors.availability = 'Use até 120 caracteres.'

    if (!values.prefersProposals) {
      const min = values.budgetMin.trim() ? Number(values.budgetMin) : null
      const max = values.budgetMax.trim() ? Number(values.budgetMax) : null
      if (min !== null && (!Number.isFinite(min) || min < 0)) nextErrors.budgetMin = 'Informe um valor válido, igual ou maior que zero.'
      if (max !== null && (!Number.isFinite(max) || max < 0)) nextErrors.budgetMax = 'Informe um valor válido, igual ou maior que zero.'
      if (min !== null && max !== null && Number.isFinite(min) && Number.isFinite(max) && max < min) {
        nextErrors.budgetMax = 'O valor máximo deve ser igual ou maior que o mínimo.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function openReview(event) {
    event.preventDefault()
    setFormError('')
    if (validate()) setStep('review')
  }

  function handleConfirm() {
    if (isSubmitting) return
    setIsSubmitting(true)
    setFormError('')
    try {
      if (isEditing) {
        const updatedRequest = requestService.update(user.id, request.id, values)
        onSaved(updatedRequest)
      } else {
        const createdRequest = requestService.create(user.id, values)
        navigate(`/meus-pedidos/${createdRequest.id}`, {
          replace: true,
          state: { notice: 'Pedido salvo neste navegador. Nenhum prestador foi notificado.' },
        })
      }
    } catch (error) {
      setFormError(error.message || 'Não foi possível salvar a solicitação local.')
      setIsSubmitting(false)
    }
  }

  function cancelEditing() {
    if (hasUnsavedChanges && !window.confirm('Descartar as alterações que ainda não foram salvas?')) return
    onSaved(null)
  }

  const selectedCategory = serviceCategories.find(({ id }) => id === values.categoryId)
  const budgetSummary = values.prefersProposals
    ? 'Prefiro receber propostas'
    : values.budgetMin || values.budgetMax
      ? `${values.budgetMin ? formatCurrency(values.budgetMin) : 'Sem mínimo'} — ${values.budgetMax ? formatCurrency(values.budgetMax) : 'Sem máximo'}`
      : 'Sem orçamento informado'

  return (
    <section className="request-workflow" aria-labelledby="request-form-title">
      <div className="request-step-indicator" aria-label={`Etapa ${step === 'form' ? '1 de 2' : '2 de 2'}`}>
        <span className={step === 'form' ? 'is-current' : 'is-complete'}>01 · Detalhes</span>
        <span aria-hidden="true" className="request-step-rule" />
        <span className={step === 'review' ? 'is-current' : ''}>02 · Revisão</span>
      </div>

      {hasUnsavedChanges && (
        <p className="form-message form-message--info" role="status">
          Há alterações ainda não salvas. Se você sair desta edição, precisará refazê-las.
        </p>
      )}
      {formError && <p className="form-message form-message--error" role="alert">{formError}</p>}

      {step === 'form' ? (
        <form className="request-form" noValidate onSubmit={openReview}>
          <div className="request-form-section">
            <p className="request-section-kicker">O serviço</p>
            <h2 id="request-form-title">Conte o que precisa ser resolvido.</h2>
            <p className="request-section-copy">O pedido será salvo neste navegador. Não inclua dados pessoais ou endereço completo.</p>
            <FormField error={errors.title} hint="Um resumo curto ajuda a identificar o pedido." id="request-title" label="Título do pedido">
              <input autoComplete="off" maxLength={100} onChange={(event) => updateValue('title', event.target.value)} value={values.title} />
            </FormField>
            <FormField error={errors.categoryId} id="request-category" label="Categoria">
              <select onChange={(event) => updateValue('categoryId', event.target.value)} value={values.categoryId}>
                <option value="">Selecione uma categoria</option>
                {serviceCategories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
              </select>
            </FormField>
            <FormField error={errors.description} hint={`${values.description.length}/2.000 caracteres`} id="request-description" label="Descreva o que você precisa">
              <textarea maxLength={2000} onChange={(event) => updateValue('description', event.target.value)} rows={6} value={values.description} />
            </FormField>
          </div>

          <div className="request-form-section">
            <p className="request-section-kicker">Onde e quando</p>
            <h2>Ajude a entender o contexto.</h2>
            <div className="request-fields-grid">
              <FormField error={errors.city} id="request-city" label="Cidade">
                <input autoComplete="address-level2" maxLength={80} onChange={(event) => updateValue('city', event.target.value)} value={values.city} />
              </FormField>
              <FormField error={errors.region} hint="Ex.: PR" id="request-region" label="Estado ou região">
                <input autoComplete="address-level1" maxLength={40} onChange={(event) => updateValue('region', event.target.value)} value={values.region} />
              </FormField>
              <FormField error={errors.neighborhood} hint="Não informe rua ou número." id="request-neighborhood" label="Bairro (opcional)" required={false}>
                <input autoComplete="off" maxLength={80} onChange={(event) => updateValue('neighborhood', event.target.value)} value={values.neighborhood} />
              </FormField>
              <FormField hint="Se ainda não souber, deixe em branco." id="request-date" label="Data desejada (opcional)" required={false}>
                <input onChange={(event) => updateValue('desiredDate', event.target.value)} type="date" value={values.desiredDate} />
              </FormField>
            </div>
            <FormField error={errors.availability} hint="Ex.: manhã durante a semana." id="request-availability" label="Preferência de horário (opcional)" required={false}>
              <input maxLength={120} onChange={(event) => updateValue('availability', event.target.value)} value={values.availability} />
            </FormField>
          </div>

          <div className="request-form-section">
            <p className="request-section-kicker">Orçamento</p>
            <h2>Compartilhe sua referência, se tiver.</h2>
            <label className="request-checkbox-row">
              <input checked={values.prefersProposals} onChange={(event) => updateValue('prefersProposals', event.target.checked)} type="checkbox" />
              <span>Prefiro receber propostas</span>
            </label>
            <div className="request-fields-grid request-budget-fields">
              <FormField error={errors.budgetMin} hint="Opcional; deixe em branco se não tiver mínimo." id="request-budget-min" label="Orçamento mínimo (R$)" required={false}>
                <input disabled={values.prefersProposals} min="0" onChange={(event) => updateValue('budgetMin', event.target.value)} step="0.01" type="number" value={values.budgetMin} />
              </FormField>
              <FormField error={errors.budgetMax} hint="Opcional; não pode ser menor que o mínimo." id="request-budget-max" label="Orçamento máximo (R$)" required={false}>
                <input disabled={values.prefersProposals} min="0" onChange={(event) => updateValue('budgetMax', event.target.value)} step="0.01" type="number" value={values.budgetMax} />
              </FormField>
            </div>
          </div>

          <div className="request-form-actions">
            {isEditing && <Button onClick={cancelEditing} variant="secondary">Cancelar edição</Button>}
            <Button type="submit">Revisar solicitação</Button>
          </div>
        </form>
      ) : (
        <div className="request-review" aria-labelledby="request-form-title">
          <p className="request-section-kicker">Confira antes de registrar</p>
          <h2 id="request-form-title">Revise sua solicitação.</h2>
          <p className="request-section-copy">Confirme para salvar o pedido. Prestadores não serão notificados.</p>
          <Card className="request-receipt">
            <div className="request-receipt-heading">
              <span>FECHOU! · PEDIDO {isEditing ? 'EM EDIÇÃO' : 'RASCUNHO'}</span>
              <span>{selectedCategory?.name ?? 'Categoria'}</span>
            </div>
            <h3>{values.title}</h3>
            <p className="request-receipt-description">{values.description}</p>
            <dl className="request-summary-list">
              <div><dt>Local</dt><dd>{[values.neighborhood, values.city, values.region].filter(Boolean).join(', ')}</dd></div>
              <div><dt>Data desejada</dt><dd>{formatDesiredDate(values.desiredDate)}</dd></div>
              <div><dt>Horário</dt><dd>{values.availability || 'Sem preferência informada'}</dd></div>
              <div><dt>Orçamento</dt><dd>{budgetSummary}</dd></div>
            </dl>
            <p className="request-receipt-footnote">Resumo do pedido · ainda não enviado a prestadores</p>
          </Card>
          <div className="request-form-actions">
            <Button disabled={isSubmitting} onClick={() => setStep('form')} variant="secondary">Voltar e editar</Button>
            <Button disabled={isSubmitting} onClick={handleConfirm}>
              {isSubmitting && <LoadingSpinner label={isEditing ? 'Salvando alterações' : 'Criando solicitação'} />}
              {isSubmitting ? 'Salvando…' : isEditing ? 'Confirmar alterações' : 'Confirmar solicitação'}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

export default RequestForm
