export function observeHomeSections(root, onActiveSection, Observer = globalThis.IntersectionObserver) {
  const sections = Array.from(root?.querySelectorAll('.home-section') ?? [])

  if (sections.length === 0 || typeof Observer !== 'function') {
    return () => {}
  }

  const activeObserver = new Observer(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) onActiveSection(entry.target.id)
      })
    },
    { rootMargin: '-30% 0px -60% 0px' },
  )

  const revealObserver = new Observer(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      })
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
  )

  sections.forEach((section, index) => {
    activeObserver.observe(section)
    if (index > 0) revealObserver.observe(section)
  })

  return () => {
    activeObserver.disconnect()
    revealObserver.disconnect()
  }
}
