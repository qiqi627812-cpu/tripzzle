import AnimalMascot from './AnimalMascot'
import { getAnimalRole } from '../data/animalRoles'

export default function AnimalPageHero({
  role = 'cat',
  eyebrow,
  title,
  subtitle,
  compact = false,
  children,
}) {
  const animal = getAnimalRole(role)
  return (
    <section
      className={`animal-page-hero relative overflow-hidden rounded-2xl border px-5 sm:px-7 ${
        compact ? 'py-4' : 'py-5 sm:py-6'
      }`}
      style={{
        '--animal-accent': animal.accent,
        '--animal-pale': animal.pale,
      }}
    >
      <div className="relative z-10 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold tracking-[0.14em] text-[var(--animal-accent)]">
            {eyebrow || animal.name}
          </div>
          <h1 className={`max-w-3xl font-display font-normal leading-tight text-trip-ink ${compact ? 'mt-1 text-xl' : 'mt-2 text-2xl sm:text-[2rem]'}`}>
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-trip-slate">{subtitle}</p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
        <AnimalMascot role={role} size={compact ? 'md' : 'xl'} className="self-end shrink-0 animal-hero-mascot sm:self-auto" />
      </div>
    </section>
  )
}
