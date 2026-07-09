import {
  Clock,
  History,
  KeyRound,
  LayoutDashboard,
  UserCog
} from 'lucide-react'
import type { SidebarNavGroup } from '~/components/navigation-sidebar'

export const getAppNavigation = (): SidebarNavGroup[] => [
  {
    label: 'Workspace',
    items: [
      {
        title: 'Dashboard',
        url: '/app',
        icon: LayoutDashboard,
        exact: true
      },
      {
        title: 'Tracking logs',
        url: '/app/tracking-logs',
        icon: History
      },
      {
        title: 'Manual entry',
        url: '/app/manual',
        icon: Clock
      },
      {
        title: 'API keys',
        url: '/api-keys',
        icon: KeyRound
      },
      {
        title: 'Profile',
        url: '/profile',
        icon: UserCog
      }
    ]
  }
]
