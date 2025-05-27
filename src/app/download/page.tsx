'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SetupPreview from '../../components/SetupPreview';

export default function DownloadPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch('/api/download/sintrix-ai-windows.exe');
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SintrixAI-Setup.exe';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">Download SintrixAI</h1>
        
        <div className="bg-white/30 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl mb-4">SintrixAI Desktop Studio</h2>
          
          <div className="mb-6">
            <p className="text-lg mb-2">Version: 1.0.0</p>
            <p className="text-gray-600">Compatible with Windows 10 and above</p>          <div className="mt-4 text-left">
            <h3 className="font-bold mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>5-Second AI Training with Pre-trained Models</li>
              <li>Interactive Setup Wizard</li>
              <li>Custom AI Model Creation</li>
              <li>Free API Access & Hosting</li>
              <li>AI Playground Environment</li>
              <li>One-Click Model Deployment</li>
            </ul>
          </div>

          <div className="mt-6 text-left bg-blue-500/10 p-4 rounded-lg">
            <h3 className="font-bold mb-2">🚀 Quick Setup Process:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Download and run SintrixAI Setup</li>
              <li>Choose from pre-trained models</li>
              <li>Customize your AI in 5 seconds</li>
              <li>Get your free API key</li>
              <li>Start using your AI!</li>
            </ol>
          </div>
        </div>

          <div className="space-y-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg w-full max-w-md transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50"
            >
              {downloading ? 'Downloading...' : 'Download for Windows'}
            </button>

            <div className="text-sm text-gray-600">
              <p>File size: 24.5 MB</p>
              <p>SHA-256: auto-generated upon build</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/30 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">System Requirements</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Windows 10 or Windows 11</li>
            <li>4GB RAM minimum</li>
            <li>100MB free disk space</li>
            <li>Internet connection for API access</li>
          </ul>
        </div>

        <SetupPreview />

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
