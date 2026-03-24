import { useState } from 'react'
import Navbar from '../components/common/Navbar'
import Loading from '../components/common/Loading'
import StatsCard from '../components/dashboard/StatsCard'
import ProgressBar from '../components/dashboard/ProgressBar'
import StreakDisplay from '../components/dashboard/StreakDisplay'
import TaskList from '../components/tasks/TaskList'
import CreateTaskModal from '../components/tasks/CreateTaskModal'
import { useDashboard, useTasks } from '../hooks/useData'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { refreshUser } = useAuth()
  const { dashboard, loading, fetchDashboard } = useDashboard()
  const { tasks, loading: tasksLoading, fetchTasks, completeTask, deleteTask } = useTasks()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleTaskComplete = async (taskId: string) => {
    await completeTask(taskId)
    await fetchDashboard() // Refresh dashboard to update points/streak
    await refreshUser() // Refresh user in navbar
  }

  const handleTaskDelete = async (taskId: string) => {
    await deleteTask(taskId)
  }

  const handleTaskCreated = async () => {
    await fetchTasks()
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading fullScreen text="Loading dashboard..." />
      </>
    )
  }

  if (!dashboard) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600">Failed to load dashboard</p>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {dashboard.user.username || dashboard.user.email.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's your progress overview</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Points"
            value={dashboard.user.totalPoints}
            icon="⭐"
            color="yellow"
          />
          <StatsCard
            title="Current Level"
            value={dashboard.user.currentLevel}
            icon="🏆"
            color="purple"
            subtitle={dashboard.progress.current.name}
          />
          <StatsCard
            title="Tasks Completed"
            value={`${dashboard.tasks.completed}/${dashboard.tasks.total}`}
            icon="✅"
            color="green"
            subtitle={`${dashboard.tasks.completionRate}% completion`}
          />
          <StatsCard
            title="Current Streak"
            value={dashboard.streak.currentStreak}
            icon="🔥"
            color="blue"
            subtitle={`Longest: ${dashboard.streak.longestStreak} days`}
          />
        </div>

        {/* Progress and streak */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProgressBar progress={dashboard.progress} />
          <StreakDisplay streak={dashboard.streak} />
        </div>

        {/* Task list */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <TaskList
            tasks={tasks}
            loading={tasksLoading}
            onComplete={handleTaskComplete}
            onDelete={handleTaskDelete}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        </div>

        {/* Recent activity */}
        {dashboard.recentActivity.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {dashboard.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {activity.action === 'COMPLETED' && '✅'}
                      {activity.action === 'CREATED' && '📝'}
                      {activity.action === 'DELETED' && '🗑️'}
                      {activity.action === 'RESET' && '🔄'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action === 'COMPLETED' && 'Task completed'}
                        {activity.action === 'CREATED' && 'Task created'}
                        {activity.action === 'DELETED' && 'Task deleted'}
                        {activity.action === 'RESET' && 'Task reset'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {activity.pointsAwarded > 0 && (
                    <span className="text-sm font-semibold text-green-600">
                      +{activity.pointsAwarded} points
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create task modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  )
}

export default Dashboard
