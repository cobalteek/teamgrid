import { deleteExpiredUnverifiedUsers } from '~~/server/utils/unverified-user-cleanup'

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000

export default defineNitroPlugin(() => {
  const runCleanup = async () => {
    try {
      const result = await deleteExpiredUnverifiedUsers()

      if (result.count > 0) {
        console.info(`Deleted ${result.count} expired unverified user(s)`)
      }
    } catch (error) {
      console.error('Failed to delete expired unverified users', error)
    }
  }

  void runCleanup()

  const timer = setInterval(() => {
    void runCleanup()
  }, CLEANUP_INTERVAL_MS)

  timer.unref?.()
})
