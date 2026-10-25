const ACCOUNTS_KEY = 'fechou.demo.accounts.v1'
const SESSION_KEY = 'fechou.demo.session.v1'
const DEMO_ACCOUNT_ID = 'fechou-demo-user'

function readAccounts() {
  const savedAccounts = window.localStorage.getItem(ACCOUNTS_KEY)
  if (!savedAccounts) return []

  const accounts = JSON.parse(savedAccounts)
  if (!Array.isArray(accounts)) {
    throw new Error('Não foi possível ler os perfis salvos neste navegador.')
  }

  return accounts
}

function saveAccounts(accounts) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function startSession(account) {
  window.sessionStorage.setItem(SESSION_KEY, account.id)
  return account
}

function normalizeAccount(account) {
  if (account?.id === DEMO_ACCOUNT_ID && account.name === 'Pessoa demonstrativa') {
    return { ...account, name: 'Pessoa usuária' }
  }
  return account
}

function makeAccount({ id, name, email, isDemo = false }) {
  return {
    id,
    name: name.trim(),
    email: email.trim().toLocaleLowerCase('pt-BR'),
    city: isDemo ? 'Curitiba' : '',
    region: isDemo ? 'PR' : '',
    bio: '',
    isDemo,
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Retorna a conta local associada à aba atual, se houver. */
function getCurrentUser() {
  try {
    const accountId = window.sessionStorage.getItem(SESSION_KEY)
    if (!accountId) return null

    const account = readAccounts().find((item) => item.id === accountId)
    if (!account) window.sessionStorage.removeItem(SESSION_KEY)
    return normalizeAccount(account) ?? null
  } catch {
    return null
  }
}

/** Cria uma identidade local e abre a sessão sem persistir a senha informada. */
function createAccount({ name, email }) {
  const normalizedEmail = email.trim().toLocaleLowerCase('pt-BR')
  const accounts = readAccounts()

  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('Já existe um perfil com este e-mail. Entre ou use outro endereço.')
  }

  const account = makeAccount({ id: createId(), name, email: normalizedEmail })
  saveAccounts([...accounts, account])
  return startSession(normalizeAccount(account))
}

/** Abre uma conta local já cadastrada; a senha nunca é recebida nesta camada. */
function signIn({ email }) {
  const normalizedEmail = email.trim().toLocaleLowerCase('pt-BR')
  const account = readAccounts().find((item) => item.email === normalizedEmail)

  if (!account) {
    throw new Error('Não encontramos um perfil para este e-mail. Cadastre-se ou continue com um perfil de teste.')
  }

  return startSession(normalizeAccount(account))
}

/** Cria ou reabre o perfil de teste apresentado na tela de login. */
function signInDemo() {
  const accounts = readAccounts()
  const existingAccount = accounts.find((account) => account.id === DEMO_ACCOUNT_ID)
  if (existingAccount) return startSession(normalizeAccount(existingAccount))

  const account = makeAccount({
    id: DEMO_ACCOUNT_ID,
    name: 'Pessoa usuária',
    email: 'demo@fechou.local',
    isDemo: true,
  })
  saveAccounts([...accounts, account])
  return startSession(account)
}

function updateProfile(accountId, changes) {
  const accounts = readAccounts()
  const index = accounts.findIndex((account) => account.id === accountId)
  if (index < 0) throw new Error('Este perfil local não está mais disponível. Entre novamente para continuar.')

  const account = {
    ...accounts[index],
    name: changes.name.trim(),
    city: changes.city.trim(),
    region: changes.region.trim(),
    bio: changes.bio.trim(),
  }
  accounts[index] = account
  saveAccounts(accounts)
  return account
}

function logout() {
  window.sessionStorage.removeItem(SESSION_KEY)
}

const authService = {
  createAccount,
  getCurrentUser,
  logout,
  signIn,
  signInDemo,
  updateProfile,
}

export default authService
