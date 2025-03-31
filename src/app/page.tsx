import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { getAuthUser } from '@/lib/auth';

export default async function Home() {
  const user = await getAuthUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold mb-8">Adyt Studios</h1>
        <p className="text-xl mb-8">Your creative image generation studio</p>
        
        {!user ? (
          <div className="space-x-4">
            <Link
              href="/auth/signup"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Up
            </Link>
            <Link
              href="/auth/login"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Log In
            </Link>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-xl">Welcome back, {user.name || user.email}!</p>
            <Link 
              href="/lab" 
              className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Lab
            </Link>
            <div>
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
