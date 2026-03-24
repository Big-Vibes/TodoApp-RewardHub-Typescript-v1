import { useState, useEffect } from 'react'
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems,} from '@headlessui/react'
import { Bell, Menu as MenuIcon, X, Trophy, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Loading from '../components/common/Loading'
import { useTasks, useDashboard } from '../hooks/useData'
import { useAuth } from '../contexts/AuthContext'
import { taskService } from '../services/task.service'
import { leaderboardService } from '../services/dashboard.service'
import type { LeaderboardEntry } from '../types'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Dashboard', current: true },
  { name: 'Team', current: false },
  { name: 'Top Earner', current: false },
  { name: 'Calendar', current: false },
]

const userNavigation = [
  { name: 'Task for today' },
  { name: 'Claim 100 gold' },
  { name: 'Remember to set your passwords' },
]

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { dashboard, loading, fetchDashboard } = useDashboard()
  const { tasks, loading: tasksLoading, completeTask } = useTasks()
  const [dailyPoints, setDailyPoints] = useState({
    dailyPoints: 0,
    dailyLimit: 1000,
    remaining: 1000,
    percentComplete: 0,
  })
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    void fetchDailyPoints()
    void fetchLeaderboard()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchDailyPoints = async () => {
    try {
      const data = await taskService.getDailyPoints()
      setDailyPoints(data)
    } catch (error) {
      console.error('Failed to fetch daily points:', error)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true)
      const response = await leaderboardService.getLeaderboard(1, 10)
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  const handleTaskComplete = async (taskId: string) => {
    await completeTask(taskId)
    await fetchDashboard()
    await fetchDailyPoints()
    await fetchLeaderboard()
    await refreshUser()
  }

  const handleDailyCheckIn = async (day: number) => {
    if (dashboard?.streak && dashboard.streak.daysCompleted >= day) {
      toast.error('You already checked in today!')
      return
    }
    toast.success('+5 points for daily check-in!')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) {
    return <Loading fullScreen text="Loading dashboard..." />
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Failed to load dashboard</p>
      </div>
    )
  }

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="min-h-screen bg-gray-50">
      <Disclosure as="nav" className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Rewards Hub</h2>

            <div className="hidden md:flex items-center gap-4">
              <Menu as="div" className="relative">
                <MenuButton className="rounded-full border border-gray-300 p-2 text-gray-500 hover:text-black">
                  <span className="sr-only">Open notifications</span>
                  <Bell className="h-5 w-5" />
                </MenuButton>
                <MenuItems className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {userNavigation.map((item) => (
                    <MenuItem key={item.name}>
                      {({ focus }) => (
                        <button
                          className={classNames(
                            focus && 'bg-gray-100',
                            'block w-full px-4 py-2 text-left text-sm text-gray-700'
                          )}
                        >
                          {item.name}
                        </button>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>

              <button
                onClick={handleLogout}
                className="rounded-full bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-black"
              >
                Sign out
              </button>
            </div>

            <div className="md:hidden">
              <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100">
                <MenuIcon className="block h-6 w-6 group-data-[open]:hidden" />
                <X className="hidden h-6 w-6 group-data-[open]:block" />
              </DisclosureButton>
            </div>
          </div>
        </div>

        <DisclosurePanel className="md:hidden border-t border-gray-200">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                className={classNames(
                  item.current ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100',
                  'block w-full rounded-md px-3 py-2 text-left text-sm font-medium'
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        </DisclosurePanel>
      </Disclosure>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-700">
          Earn points, unlock rewards, and celebrate your progress
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button className="rounded-md bg-purple-300 px-3.5 py-2 text-sm font-semibold text-purple-800 transition hover:bg-purple-200">
            Earn Points
          </button>
          <button className="rounded-md px-3.5 py-2 text-sm font-semibold text-purple-800 transition hover:bg-purple-200">
            Redeem Rewards
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">
                Welcome, {dashboard.user.username || dashboard.user.email.split('@')[0]}!
              </h1>
              <p className="text-purple-100">Track your progress and climb the leaderboard</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-100">Total Points</p>
              <p className="text-5xl font-bold">{dashboard.user.totalPoints}</p>
              <p className="mt-1 text-sm text-purple-100">
                Level {dashboard.user.currentLevel} - {dashboard.progress.current.name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Task Checklist</h2>
              <span className="text-sm text-gray-600">20 pts per click</span>
            </div>

            <div className="space-y-3">
              {tasksLoading ? (
                <Loading text="Loading tasks..." />
              ) : tasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-600">
                  No tasks yet
                </div>
              ) : (
                tasks.map((task) => {
                  const cooldownUntilMs = task.cooldownUntil ? new Date(task.cooldownUntil).getTime() : 0
                  const remainingMs = Math.max(0, cooldownUntilMs - now)
                  const remainingMinutes = Math.floor(remainingMs / 60000)
                  const remainingSeconds = Math.floor((remainingMs % 60000) / 1000)
                  const cooldownText = `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`

                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          onClick={() => handleTaskComplete(task.id)}
                          disabled={remainingMs > 0}
                          className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {remainingMs > 0 ? `Cooldown ${cooldownText}` : 'Click +20'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            

            <div className="mt-6 border-t border-gray-200 pt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Daily Progress</span>
                <span className="text-gray-600">
                  {dailyPoints.dailyPoints} / {dailyPoints.dailyLimit} pts
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                  style={{ width: `${dailyPoints.percentComplete}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Daily Checklist</h2>
              <div className="flex items-center gap-2 text-orange-600">
                <Flame className="h-6 w-6" />
                <span className="text-lg font-bold">{dashboard.streak.currentStreak}</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day, index) => {
                const isCompleted = index < dashboard.streak.daysCompleted
                const isToday = index === dashboard.streak.daysCompleted
                return (
                  <button
                    key={day}
                    onClick={() => isToday && handleDailyCheckIn(index + 1)}
                    className={classNames(
                      isCompleted && 'border-green-500 bg-green-100',
                      isToday && 'border-blue-400 bg-blue-50',
                      !isCompleted && !isToday && 'border-gray-300 bg-gray-100',
                      'rounded-lg border-2 p-3 text-center'
                    )}
                  >
                    <div className="text-xs font-medium text-gray-700">{day}</div>
                    <div className="mt-1 text-lg">{isCompleted ? 'v' : isToday ? '*' : 'o'}</div>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 rounded-lg bg-orange-50 p-4">
              <p className="text-sm text-gray-600">Longest Streak</p>
              <p className="text-2xl font-bold text-orange-600">{dashboard.streak.longestStreak} days</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
            </div>
            <button onClick={fetchLeaderboard} className="text-sm font-medium text-purple-600 hover:text-purple-700">
              Refresh
            </button>
          </div>

          {loadingLeaderboard ? (
            <Loading text="Loading leaderboard..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Points</th>
                    <th className="px-4 py-3">Streak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboard.map((entry) => {
                    const isCurrentUser = user?.id === entry.id
                    return (
                      <tr key={entry.id} className={classNames(isCurrentUser && 'bg-purple-50')}>
                        <td className="px-4 py-3 font-semibold">{entry.rank}</td>
                        <td className="px-4 py-3">{entry.username || entry.email.split('@')[0]}</td>
                        <td className="px-4 py-3">{entry.currentLevel}</td>
                        <td className="px-4 py-3">{entry.totalPoints}</td>
                        <td className="px-4 py-3">{entry.currentStreak} days</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Dashboard
