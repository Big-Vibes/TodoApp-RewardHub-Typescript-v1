import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { LoginForm } from '../types'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  })

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData)
      navigate(from, { replace: true })
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-md"
      >
        <h2 className="mb-1 text-2xl font-bold text-gray-900">Login</h2>
        <p className="mb-6 text-sm text-gray-600">Welcome back to RewardHub</p>

        <div className="mb-4">
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-md border border-purple-200 bg-white px-3 py-2 focus:border-purple-500 focus:outline-none"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full rounded-md border border-purple-200 bg-white px-3 py-2 focus:border-purple-500 focus:outline-none"
            placeholder="********"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-purple-500 px-4 py-2 font-semibold text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-700">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-purple-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login
