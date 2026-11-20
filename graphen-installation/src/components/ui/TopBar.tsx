import { BookOpen, Moon, Sun } from 'lucide-react'
import { useStudioStore } from '../../store/useStudioStore'

export function TopBar() {
  const { theme, toggleTheme } = useStudioStore()

  return (
    <header className="top-bar">
      <a className="brand" href={import.meta.env.BASE_URL} aria-label="Graphen home">
        <img
          className="brand-logo"
          src={`${import.meta.env.BASE_URL}logo-text-${theme}.png`}
          alt="Graphen"
        />
      </a>

      <div className="top-bar-actions">
        <a className="icon-button" href={`${import.meta.env.BASE_URL}docs/`} aria-label="AAL documentation" title="Documentation">
          <BookOpen size={18} />
        </a>
        <a
          className="icon-button"
          href="https://github.com/graphen-studio/graphen"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Graphen on GitHub (opens in a new tab)"
          title="Graphen on GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.24c-3.34.73-4.04-1.42-4.04-1.42-.55-1.4-1.35-1.77-1.35-1.77-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.62-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.6-2.81 5.62-5.49 5.92.43.38.81 1.1.81 2.22v3.28c0 .32.22.69.82.58A12 12 0 0 0 12 .5Z" />
          </svg>
        </a>
        <button
          className="icon-button"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
