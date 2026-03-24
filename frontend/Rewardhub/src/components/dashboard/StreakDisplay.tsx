import type { Streak } from '../../types'

interface StreakDisplayProps {
  streak: Streak
}

const StreakDisplay = ({ streak }: StreakDisplayProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Streak Overview</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-2xl font-bold text-orange-600">{streak.currentStreak} days</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-gray-600">Longest Streak</p>
          <p className="text-2xl font-bold text-blue-600">{streak.longestStreak} days</p>
        </div>
      </div>
    </div>
  )
}

export default StreakDisplay
