"use client";

import { useState } from 'react';

export default function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setError(null);
    setUploadedUrl(null);

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setError("Please select a file to upload.");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong.");
      }

      const data = await response.json();
      setUploadedUrl(data.url);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Supabase Image Uploader</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          name="file"
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploading}
        />
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-500">
          <p>Error: {error}</p>
        </div>
      )}

      {uploadedUrl && (
        <div className="mt-4">
          <p className="font-semibold">Upload successful!</p>
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
            {uploadedUrl}
          </a>
          <div className="mt-2">
            <img src={uploadedUrl} alt="Uploaded preview" className="max-w-full h-auto rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
