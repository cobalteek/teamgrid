export type Employee = {
  id: string
  name: string
  surname: string
  middlename: string
  position: {
    id: number
    name: string
  }
  email: string
}

export type CreateEmployee = {
  name: string
  surname: string
  middlename: string
  position: string
  email: string
}