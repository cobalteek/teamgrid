import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { EMPLOYEE_COLORS, POSITION_COLORS } from '../shared/utils/defaultColors'

const prisma = new PrismaClient()
const demoDate = new Date()
const demoYear = demoDate.getUTCFullYear()
const demoMonth = demoDate.getUTCMonth()
const daysInDemoMonth = new Date(Date.UTC(demoYear, demoMonth + 1, 0)).getUTCDate()

type PositionSeed = {
  name: string
  fullName: string
  salaryType?: 'hourly' | 'per_shift' | 'monthly'
  salaryAmount?: number
}

type EmployeeSeed = {
  name: string
  surname: string
  middlename: string
  position: string
  salaryType?: 'hourly' | 'per_shift' | 'monthly'
  salaryAmount?: number
}

type OrganizationSeed = {
  id: number
  name: string
  description: string
  slug: string
  positions: PositionSeed[]
  employees: EmployeeSeed[]
}

const organizations: OrganizationSeed[] = [
  {
    id: 1,
    name: 'Демо: Бизнес-центр «Северная линия»',
    description:
      'Демонстрационная организация: ресепшен, клининг, безопасность и техническая служба. В расписании показаны дневные, вечерние и круглосуточные дежурства.',
    slug: 'severnaya-line',
    positions: [
      {
        name: 'Администратор',
        fullName: 'Администратор бизнес-центра',
        salaryType: 'hourly',
        salaryAmount: 450,
      },
      {
        name: 'Менеджер смены',
        fullName: 'Менеджер операционной смены',
        salaryType: 'monthly',
        salaryAmount: 120000,
      },
      {
        name: 'Ресепшен',
        fullName: 'Специалист стойки ресепшен',
        salaryType: 'per_shift',
        salaryAmount: 3500,
      },
      {
        name: 'Инженер',
        fullName: 'Инженер по эксплуатации здания',
        salaryType: 'hourly',
        salaryAmount: 700,
      },
      {
        name: 'Клининг',
        fullName: 'Специалист клининговой службы',
        salaryType: 'per_shift',
        salaryAmount: 2500,
      },
      {
        name: 'Охрана',
        fullName: 'Сотрудник службы безопасности',
        salaryType: 'hourly',
        salaryAmount: 400,
      },
    ],
    employees: [
      {
        name: 'Анна',
        surname: 'Сергеева',
        middlename: 'Игоревна',
        position: 'Администратор',
        salaryType: 'per_shift',
        salaryAmount: 500,
      },
      { name: 'Иван', surname: 'Петров', middlename: 'Алексеевич', position: 'Менеджер смены' },
      { name: 'Мария', surname: 'Волкова', middlename: 'Олеговна', position: 'Ресепшен' },
      { name: 'Олег', surname: 'Смирнов', middlename: 'Дмитриевич', position: 'Ресепшен' },
      { name: 'Елена', surname: 'Кузнецова', middlename: 'Романовна', position: 'Инженер' },
      { name: 'Максим', surname: 'Орлов', middlename: 'Викторович', position: 'Инженер' },
      {
        name: 'Дарья',
        surname: 'Белова',
        middlename: 'Андреевна',
        position: 'Клининг',
        salaryType: 'per_shift',
        salaryAmount: 3850,
      },
      { name: 'Сергей', surname: 'Никитин', middlename: 'Павлович', position: 'Клининг' },
      { name: 'Полина', surname: 'Морозова', middlename: 'Ильинична', position: 'Клининг' },
      { name: 'Артём', surname: 'Соколов', middlename: 'Евгеньевич', position: 'Охрана' },
      { name: 'Виктория', surname: 'Лебедева', middlename: 'Максимовна', position: 'Охрана' },
      { name: 'Николай', surname: 'Фёдоров', middlename: 'Степанович', position: 'Охрана' },
    ],
  },
  {
    id: 2,
    name: 'Демо: Сервис «Маяк»',
    description:
      'Демонстрационная организация для клиентского сервиса: поддержка, контроль качества и контент. Данные полностью вымышлены и предназначены для просмотра возможностей TeamGrid.',
    slug: 'mayak-service',
    positions: [
      {
        name: 'Старший оператор',
        fullName: 'Старший оператор клиентской поддержки',
        salaryType: 'monthly',
        salaryAmount: 110000,
      },
      {
        name: 'Оператор',
        fullName: 'Оператор клиентской поддержки',
        salaryType: 'per_shift',
        salaryAmount: 3000,
      },
      {
        name: 'Техподдержка',
        fullName: 'Специалист технической поддержки',
        salaryType: 'hourly',
        salaryAmount: 600,
      },
      {
        name: 'Контент',
        fullName: 'Контент-менеджер базы знаний',
        salaryType: 'monthly',
        salaryAmount: 90000,
      },
      {
        name: 'Контроль качества',
        fullName: 'Специалист контроля качества',
        salaryType: 'hourly',
        salaryAmount: 550,
      },
    ],
    employees: [
      {
        name: 'Ксения',
        surname: 'Андреева',
        middlename: 'Михайловна',
        position: 'Старший оператор',
        salaryType: 'monthly',
        salaryAmount: 125000,
      },
      {
        name: 'Роман',
        surname: 'Громов',
        middlename: 'Сергеевич',
        position: 'Старший оператор',
        salaryType: 'per_shift',
        salaryAmount: 3800,
      },
      { name: 'Алина', surname: 'Ершова', middlename: 'Денисовна', position: 'Оператор' },
      { name: 'Тимур', surname: 'Власов', middlename: 'Рустамович', position: 'Оператор' },
      { name: 'София', surname: 'Крылова', middlename: 'Артуровна', position: 'Оператор' },
      { name: 'Михаил', surname: 'Зайцев', middlename: 'Владимирович', position: 'Техподдержка' },
      { name: 'Надежда', surname: 'Комарова', middlename: 'Ильинична', position: 'Техподдержка' },
      { name: 'Лев', surname: 'Баранов', middlename: 'Олегович', position: 'Контент' },
      { name: 'Ирина', surname: 'Фомина', middlename: 'Вадимовна', position: 'Контроль качества' },
      { name: 'Денис', surname: 'Тарасов', middlename: 'Артёмович', position: 'Контроль качества' },
    ],
  },
]

const shiftWindows = [
  [8 * 60, 16 * 60],
  [9 * 60, 18 * 60],
  [10 * 60, 19 * 60],
  [12 * 60, 21 * 60],
  [14 * 60, 23 * 60],
] as const

function shiftEmployeeIndexes(day: number, employeeCount: number) {
  const indexes = [day % employeeCount, (day * 2 + 1) % employeeCount]

  if (day % 3 === 0) indexes.push((day * 3 + 2) % employeeCount)
  if (day % 7 === 0) indexes.push((day * 4 + 3) % employeeCount)

  return [...new Set(indexes)]
}

async function seedOrganization(seed: OrganizationSeed) {
  const existing = await prisma.organization.findUnique({ where: { id: seed.id } })

  if (!existing) {
    throw new Error(`Organization with id ${seed.id} was not found`)
  }

  const nameCollision = await prisma.organization.findFirst({
    where: { name: seed.name, NOT: { id: seed.id } },
    select: { id: true },
  })

  if (nameCollision) {
    throw new Error(`Organization name is already used by id ${nameCollision.id}: ${seed.name}`)
  }

  await prisma.$transaction(async (tx) => {
    await tx.organization.update({
      where: { id: seed.id },
      data: {
        name: seed.name,
        description: seed.description,
      },
    })

    await tx.shift.deleteMany({ where: { organizationId: seed.id } })
    await tx.vacation.deleteMany({ where: { organizationId: seed.id } })
    await tx.employee.deleteMany({ where: { organizationId: seed.id } })
    await tx.position.deleteMany({ where: { organizationId: seed.id } })

    const positions = new Map<string, { id: number }>()
    for (const [index, position] of seed.positions.entries()) {
      const created = await tx.position.create({
        data: {
          name: position.name,
          fullName: position.fullName,
          organizationId: seed.id,
          color: POSITION_COLORS[index % POSITION_COLORS.length],
          salaryType: position.salaryType ?? null,
          salaryAmount: position.salaryAmount ?? null,
        },
        select: { id: true },
      })
      positions.set(position.name, created)
    }

    const employees = []
    for (const [index, employee] of seed.employees.entries()) {
      const position = positions.get(employee.position)
      if (!position) throw new Error(`Position not found: ${employee.position}`)

      const created = await tx.employee.create({
        data: {
          name: employee.name,
          surname: employee.surname,
          middlename: employee.middlename,
          positionId: position.id,
          organizationId: seed.id,
          email: `${seed.slug}-${String(index + 1).padStart(2, '0')}@example.com`,
          color: EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length],
          salaryType: employee.salaryType ?? null,
          salaryAmount: employee.salaryAmount ?? null,
        },
        select: { id: true, positionId: true },
      })
      employees.push({ id: created.id, positionId: position.id })
    }

    const shifts = []
    for (let day = 1; day <= daysInDemoMonth; day += 1) {
      for (const [slot, employeeIndex] of shiftEmployeeIndexes(day, employees.length).entries()) {
        const employee = employees[employeeIndex]
        const allDay = (day + employeeIndex) % 6 === 0
        const window = shiftWindows[(day + slot + employeeIndex) % shiftWindows.length]

        shifts.push({
          date: new Date(Date.UTC(demoYear, demoMonth, day)),
          employeeId: employee.id,
          positionId: employee.positionId,
          organizationId: seed.id,
          allDay,
          startTime: allDay ? null : window[0],
          endTime: allDay ? null : window[1],
        })
      }
    }

    await tx.shift.createMany({ data: shifts })
  })

  const counts = await prisma.organization.findUniqueOrThrow({
    where: { id: seed.id },
    select: {
      name: true,
      _count: { select: { employees: true, positions: true, shifts: true, members: true } },
    },
  })

  console.log(`${counts.name}:`, counts._count)
}

async function main() {
  for (const organization of organizations) {
    await seedOrganization(organization)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
