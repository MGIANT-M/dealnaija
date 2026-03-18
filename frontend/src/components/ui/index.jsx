export function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' }[size]
  return <div className={s + ' border-brand-500 border-t-transparent rounded-full animate-spin'} />
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="font-display font-semibold text-earth-800 text-lg mb-2">{title}</h3>
      {description && <p className="text-earth-500 text-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}

export function Alert({ type = 'info', message }) {
  const styles = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  }
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' }
  return (
    <div className={'flex items-start gap-2 p-3 rounded-xl border text-sm ' + styles[type]}>
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  )
}

export function TrustScore({ score }) {
  const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-earth-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-green-500 transition-all" style={{ width: score + '%' }} />
      </div>
      <span className={'text-sm font-bold ' + color}>{score}/100</span>
    </div>
  )
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-earth-100">
          <h2 className="font-display font-semibold text-earth-900 text-lg">{title}</h2>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-700 text-xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-earth-100">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function DealStageBadge({ stage }) {
  const map = {
    inquiry_received: { label: 'Inquiry', color: 'bg-gray-100 text-gray-600' },
    inspection_scheduled: { label: 'Inspection', color: 'bg-blue-100 text-blue-700' },
    negotiation: { label: 'Negotiation', color: 'bg-yellow-100 text-yellow-700' },
    deal_closed: { label: 'Closed ✓', color: 'bg-green-100 text-green-700' },
  }
  const s = map[stage] || map.inquiry_received
  return <span className={'text-xs font-semibold px-2 py-1 rounded-full ' + s.color}>{s.label}</span>
}
