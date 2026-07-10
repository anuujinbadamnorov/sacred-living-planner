export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className="py-6 px-8 border-t"
      style={{
        background: 'var(--cream-dark)',
        borderColor: 'var(--border-medium)',
      }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="font-semibold text-sm"
            style={{ color: 'var(--espresso)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Sacred Living Planner
          </span>
          <span className="text-xs" style={{ color: 'var(--espresso-muted)' }}>
            &copy; {currentYear}
          </span>
        </div>
        <div
          className="flex items-center gap-6 text-xs font-inter"
          style={{ color: 'var(--espresso-light)' }}
        >
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </div>
    </footer>
  )
}
