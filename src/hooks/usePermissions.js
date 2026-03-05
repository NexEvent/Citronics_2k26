/**
 * usePermissions — Centralized permission logic hook
 *
 * Two admin-portal roles:
 *   Owner — full CRUD on everything (events, users, payments, analytics)
 *   Admin — read-only on dashboard, events, payments, analytics (NO users page)
 *
 * Usage:
 *   const { canCreate, canEdit, canDelete, isOwner, isAdmin, role } = usePermissions()
 */
import { useSession } from 'next-auth/react'
import { useCallback, useMemo } from 'react'
import { isOwner as checkOwner } from 'src/configs/acl'

const usePermissions = () => {
  const { data: session } = useSession()
  const role = session?.user?.role?.toLowerCase() || ''
  const userId = session?.user?.id

  const ownerFlag = useMemo(() => checkOwner(role), [role])

  // Only Owner can create / edit / delete
  const canCreate = useCallback(() => ownerFlag, [ownerFlag])
  const canEdit = useCallback(() => ownerFlag, [ownerFlag])
  const canDelete = useCallback(() => ownerFlag, [ownerFlag])

  const canViewPayments = useMemo(() => ownerFlag || role === 'admin', [ownerFlag, role])
  const canViewUsers = useMemo(() => ownerFlag, [ownerFlag]) // Admin cannot see users page

  return {
    role,
    userId,
    isOwner: ownerFlag,
    isAdmin: role === 'admin',
    canModify: ownerFlag,
    canCreate,
    canEdit,
    canDelete,
    canViewPayments,
    canViewUsers
  }
}

export default usePermissions
