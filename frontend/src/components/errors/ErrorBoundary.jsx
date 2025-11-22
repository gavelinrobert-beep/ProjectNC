import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo)
    this.setState({ error })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">An unexpected error occurred. Please try again.</p>
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
