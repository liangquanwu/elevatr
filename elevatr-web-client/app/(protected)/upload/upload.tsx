"use client";

import { Fragment, useRef } from "react";

interface UploadProps {
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
}

export default function Upload({ onUpload, loading }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    if (file) {
      await onUpload(file);
    }
  };

  return (
    <Fragment>
      <input
        ref={inputRef}
        id="upload"
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={loading}
        onClick={handleButtonClick}
        className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          "Upload Video"
        )}
      </button>
    </Fragment>
  );
}