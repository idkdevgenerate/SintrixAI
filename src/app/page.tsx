'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const DynamicModelSelector = dynamic(
  () => import('../components/ModelSelector'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">SintrixAI Demo</h1>
        
        <div className="text-center mb-8">
          <p className="text-lg mb-4">
            Train your own AI model using our pre-trained models or create a custom one.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/download"
              className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:scale-105"
            >
              Download Desktop App
            </Link>
            <a 
              href="#train"
              className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:scale-105"
            >
              Train in Browser
            </a>
          </div>
        </div>

        <div id="train">
          <DynamicModelSelector />
        </div>
      </div>
    </main>
  );
}
