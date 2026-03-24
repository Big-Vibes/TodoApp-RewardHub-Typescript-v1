import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { House, Trophy, CircleUserRound, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import clsx from 'clsx'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: House },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
                🎯 RewardHub
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              {/* Points display */}
              <div className="hidden md:flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg">
                <span className="text-2xl">⭐</span>
                <div className="text-left">
                  <p className="text-xs text-gray-600">Points</p>
                  <p className="text-sm font-bold text-gray-900">{user?.totalPoints || 0}</p>
                </div>
              </div>

              {/* Level badge */}
              <div className="hidden md:flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-lg">
                <span className="text-2xl">🏆</span>
                <div className="text-left">
                  <p className="text-xs text-gray-600">Level</p>
                  <p className="text-sm font-bold text-gray-900">{user?.currentLevel || 1}</p>
                </div>
              </div>

              {/* User dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition">
                  <CircleUserRound className="w-6 h-6 text-gray-600" />
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="truncate text-sm font-medium text-gray-900">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={clsx(
                              active ? 'bg-gray-100' : '',
                              'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="flex space-x-1 px-2 py-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex-1 flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg',
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
