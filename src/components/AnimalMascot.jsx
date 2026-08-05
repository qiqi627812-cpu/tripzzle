import { getAnimalRole } from '../data/animalRoles'

const sizes = {
  xxs: 'w-7 h-7',
  xs: 'w-10 h-10',
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32 sm:w-40 sm:h-40',
  xl: 'w-40 h-40 sm:w-52 sm:h-52',
}

export default function AnimalMascot({
  role = 'cat',
  size = 'md',
  className = '',
  decorative = false,
}) {
  const animal = getAnimalRole(role)
  return (
    <img
      src={animal.image}
      alt={decorative ? '' : animal.name}
      aria-hidden={decorative || undefined}
      className={`object-contain drop-shadow-[0_8px_12px_rgba(79,61,43,0.10)] ${sizes[size] || sizes.md} ${className}`}
    />
  )
}
