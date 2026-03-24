import React from 'react'
import type { Progress } from '../../types'

interface ProgressBarProps {
  progress: Progress
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
          <p className="text-sm text-gray-600">
            Level {progress.current.level}: {progress.current.name}
          </p>
        </div>
        <div className="text-3xl">{progress.isMaxLevel ? '👑' : '🎯'}</div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">
            {progress.isMaxLevel ? 'Max Level!' : `${progress.progress}% to next level`}
          </span>
          {!progress.isMaxLevel && (
            <span className="text-gray-600">{progress.pointsToNext} points needed</span>
          )}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
            style={{ width: `${progress.progress}%` }}
          >
            {progress.progress > 10 && (
              <span className="text-xs font-bold text-white">{progress.progress}%</span>
            )}
          </div>
        </div>

        {!progress.isMaxLevel && progress.next && (
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <span>
              Current: {progress.current.name}
            </span>
            <span>
              Next: {progress.next.name}
            </span>
          </div>
        )}
      </div>

      {/* Milestone badges */}
      <div className="mt-6 grid grid-cols-7 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((level) => (
          <div
            key={level}
            className={`flex flex-col items-center p-2 rounded-lg transition ${
              level <= progress.current.level
                ? 'bg-primary-100 border-2 border-primary-500'
                : 'bg-gray-100 border-2 border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">
              {level === 1 && '🥉'}
              {level === 2 && '🥈'}
              {level === 3 && '🥇'}
              {level === 4 && '💎'}
              {level === 5 && '💍'}
              {level === 6 && '👑'}
              {level === 7 && '🏆'}
            </div>
            <span className="text-xs font-semibold text-gray-700">{level}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgressBar
