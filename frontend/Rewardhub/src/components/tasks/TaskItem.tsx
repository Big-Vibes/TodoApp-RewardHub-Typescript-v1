import React, { useState } from 'react'
import type { Task } from '../../types'
import { CheckCircle, Trash2, Clock3 } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

interface TaskItemProps {
  task: Task
  onComplete: (taskId: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete }) => {
  const [completing, setCompleting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await onComplete(task.id)
    } finally {
      setCompleting(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setDeleting(true)
      try {
        await onDelete(task.id)
      } finally {
        setDeleting(false)
      }
    }
  }

  const isOnCooldown = task.cooldownUntil && new Date(task.cooldownUntil) > new Date()
  const canComplete = task.canComplete && !task.isCompleted

  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg',
        task.isCompleted && 'opacity-75 bg-gray-50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4
              className={clsx(
                'font-semibold text-gray-900',
                task.isCompleted && 'line-through text-gray-500'
              )}
            >
              {task.title}
            </h4>
            {task.isCompleted && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Completed
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}

          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center text-yellow-600 font-medium">
              ⭐ {task.pointValue} points
            </span>

            {task.completedAt && (
              <span className="text-gray-500">
                Completed {format(new Date(task.completedAt), 'MMM d, h:mm a')}
              </span>
            )}

            {isOnCooldown && (
              <span className="flex items-center text-orange-600">
                <Clock3 className="w-4 h-4 mr-1" />
                On cooldown
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 ml-4">
          {!task.isCompleted && (
            <button
              onClick={handleComplete}
              disabled={!canComplete || completing}
              className={clsx(
                'p-2 rounded-lg transition',
                canComplete
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-gray-400 cursor-not-allowed'
              )}
              title={canComplete ? 'Complete task' : 'Task on cooldown or already completed'}
            >
              {completing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600"></div>
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete task"
          >
            {deleting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskItem
