import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'yellow'
  subtitle?: string
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  yellow: 'from-yellow-500 to-yellow-600',
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 flex items-center justify-between`}>
        <div>
          <p className="text-white text-opacity-90 text-sm font-medium">{title}</p>
          <p className="text-white text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-white text-opacity-75 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="text-5xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}

export default StatsCard
