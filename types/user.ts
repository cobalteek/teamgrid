export type User = {
  id: string
  email: string
  name: string
  gender: string
  roles: string[]
  organization: {
    id: number
    name: string
  }
}
