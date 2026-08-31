import { useEffect, useRef } from 'react'

/**
 * Applies the shared fade-up reveal animation to `.fade-up` children
 * inside the returned container ref.
 */
export default function useFadeUp() {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            target.classList.add('opacity-100', 'translate-y-0')
            target.classList.remove('opacity-0', 'translate-y-8')
          }
        })
      },
      { threshold: 0.1 },
    )

    const container = ref.current
    if (container) {
      const children = container.querySelectorAll<HTMLElement>('.fade-up')
      children.forEach((child, index) => {
        child.style.transitionDelay = `${index * 100}ms`
        observer.observe(child)
      })
    }

    return () => observer.disconnect()
  }, [])

  return ref
}
