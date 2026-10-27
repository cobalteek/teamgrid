export type Organization = {
  id: number
  name: string
  description: string
}

export type OrganizationRole = 'owner' | 'admin' | 'user'

export type OrganizationAccess = Organization & {
  role: OrganizationRole
  isOwner: boolean
  isManager: boolean
}
