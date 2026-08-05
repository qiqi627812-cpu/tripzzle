import AnimalMascot from './AnimalMascot'
import { getAnimalRole } from '../data/animalRoles'

export default function AnimalProgress({
  role = 'cat',
  label = '正在准备…',
  detail = '小动物正在沿着路线前进',
  className = '',
}) {
  const animal = getAnimalRole(role)
  return (
    <div
      className={`animal-progress rounded-2xl border border-white/80 bg-white/50 p-4 shadow-soft backdrop-blur-xl ${className}`}
      style={{ '--animal-accent': animal.accent, '--animal-pale': animal.pale }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-trip-ink">{label}</div>
          <div className="mt-0.5 text-xs text-trip-muted">{detail}</div>
        </div>
        <span className="rounded-full bg-[var(--animal-pale)] px-2.5 py-1 text-[11px] font-semibold text-[var(--animal-accent)]">
          {animal.name}
        </span>
      </div>
      <div className="animal-progress-track relative mt-4 h-3 rounded-full bg-[var(--animal-pale)]">
        <div className="animal-progress-fill absolute inset-y-0 left-0 rounded-full" />
        <AnimalMascot
          role={role}
          size="xs"
          decorative
          className="animal-progress-marker absolute -top-4 left-0 z-10"
        />
      </div>
    </div>
  )
}
