export type Employee = {
  id: string
  name: string
  surname: string
  middlename: string
  position: {
    id: number
    name: string,
    fullName: string
  }
  email: string
  organization: {
      id: number
      name: string
  }
  color: string
}

export type CreateEmployee = {
  name: string
  surname: string
  middlename: string
  position: string
  email: string
  organizationId: number
}