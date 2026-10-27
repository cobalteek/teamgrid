export type User = {
  id: string
  email: string
  name: string
  gender: string
  emailVerifiedAt: string | null
  organizationId: number[]
}

export type UserWithRole = {
  id: string
  email: string
  name: string
  gender: string
  emailVerifiedAt: string | null
  organizationId: number
  role: {
    id: number
    name: string
  }
}
