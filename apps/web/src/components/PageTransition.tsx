import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

type PageTransitionProps = {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const [show, setShow] = useState(true)

  useEffect(() => {
    setShow(false)
    const timer = setTimeout(() => setShow(true), 50)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease'
      }}
    >
      {children}
    </div>
  )
}