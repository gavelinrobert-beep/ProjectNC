'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
          Fantasy MMORPG
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          A Scalable World of Adventure
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/login')}
            className="block w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
          >
            Login
          </button>
          
          <button
            onClick={() => router.push('/login?register=true')}
            className="block w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
          >
            Create Account
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Built with Next.js, NestJS, and Go</p>
        </div>
      </div>
    </div>
  );
}
