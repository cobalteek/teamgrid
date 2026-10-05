import { prisma } from '../server/utils/prisma'
import {
  createEmailVerificationCode,
  createEmailVerificationDeadline,
} from '../server/utils/email-verification'
import { sendEmail } from '../server/utils/mailer'

const shouldSend = process.argv.includes('--send')
const isConfirmed = process.argv.includes('--confirm')

function maskEmail(email: string) {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '[invalid-email]'
  return `${localPart.slice(0, 2)}***@${domain}`
}

async function main() {
  if (shouldSend && !isConfirmed) {
    throw new Error('Refusing to send without both --send and --confirm')
  }

  const users = await prisma.user.findMany({
    where: {
      emailVerifiedAt: null,
      emailVerificationDeadline: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: { id: 'asc' },
  })

  console.log(
    `${shouldSend ? 'Preparing' : 'Dry run:'} ${users.length} existing unverified user(s)`,
  )

  if (!shouldSend) {
    console.log('No database rows or emails were changed.')
    return
  }

  const now = new Date()
  const deadline = createEmailVerificationDeadline(now)
  let sent = 0
  let failed = 0

  for (const user of users) {
    const { code, codeHash, expiresAt } = createEmailVerificationCode()

    try {
      await sendEmail({
        to: user.email,
        subject: 'Подтвердите электронную почту TeamGrid',
        text: [
          `Здравствуйте, ${user.name}!`,
          '',
          'Для продолжения работы в TeamGrid подтвердите адрес электронной почты.',
          '',
          `Ваш код подтверждения: ${code}`,
          'Код действителен 10 минут.',
          '',
          'Если вы не регистрировались в TeamGrid, проигнорируйте это письмо.',
        ].join('\n'),
      })

      const enrolled = await prisma.$transaction(async (tx) => {
        const result = await tx.user.updateMany({
          where: {
            id: user.id,
            emailVerifiedAt: null,
            emailVerificationDeadline: null,
          },
          data: { emailVerificationDeadline: deadline },
        })

        if (result.count !== 1) return false

        await tx.emailVerificationToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: now },
        })

        await tx.emailVerificationToken.create({
          data: {
            userId: user.id,
            codeHash,
            expiresAt,
          },
        })

        return true
      })

      if (enrolled) {
        sent += 1
        console.log(`Enrolled ${maskEmail(user.email)}`)
      }
    } catch (error) {
      failed += 1
      console.error(`Failed ${maskEmail(user.email)}`, error)
    }
  }

  console.log(`Completed: ${sent} enrolled, ${failed} failed`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
