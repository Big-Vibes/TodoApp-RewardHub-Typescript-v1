import React from 'react'
import type { Task } from '../../types'
import TaskItem from './TaskItem'
import { Plus } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  onComplete: (taskId: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  onCreateClick: () => void
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  onComplete,
  onDelete,
  onCreateClick,
}) => {
  const incompleteTasks = tasks.filter((t) => !t.isCompleted)
  const completedTasks = tasks.filter((t) => t.isCompleted)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-600 mb-6">Create your first task to start earning points!</p>
          <button
            onClick={onCreateClick}
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Task
          </button>
        </div>
      ) : (
        <>
          {/* Incomplete tasks */}
          {incompleteTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                To Do ({incompleteTasks.length})
              </h3>
              {incompleteTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={onComplete}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Completed ({completedTasks.length})
              </h3>
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={onComplete}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TaskList
