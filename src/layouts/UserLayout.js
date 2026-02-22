import AppShell from 'src/layouts/AppShell'
import { useSettings } from 'src/hooks/useSettings'

/**
 * User Layout Component
 * Wraps the main layout with settings context
 */
const UserLayout = ({ children }) => {
  const { settings, saveSettings } = useSettings()

  return (
    <AppShell settings={settings} saveSettings={saveSettings}>
      {children}
    </AppShell>
  )
}

export default UserLayout
