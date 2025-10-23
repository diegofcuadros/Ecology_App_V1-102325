
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { XIcon, FileIcon, AlertTriangleIcon, CheckCircleIcon, DocumentDuplicateIcon } from './Icons';

interface CreateStudySetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (articleFile: File, assignmentFile: File) => void;
  isCreating: boolean;
  createError: string | null;
}

const FileDropzone: React.FC<{file: File | null, onDrop: (files: File[]) => void, title: string, description: string}> = ({ file, onDrop, title, description }) => {
  const onDropCallback = useCallback(onDrop, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  return (
    <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors ${isDragActive ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
      <input {...getInputProps()} />
      {file ? (
        <div className="flex flex-col items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircleIcon className="h-10 w-10 mb-2" />
            <p className="font-semibold">{title} Uploaded</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">{file.name}</p>
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400">
            <FileIcon className="h-10 w-10 mx-auto mb-2" />
            <p className="font-semibold">{title}</p>
            <p className="text-xs">{description}</p>
            {isDragActive ? <p className="text-xs mt-1">Drop the file here...</p> : <p className="text-xs mt-1">Drag & drop or click to select</p>}
        </div>
      )}
    </div>
  );
};


export const CreateStudySetModal: React.FC<CreateStudySetModalProps> = ({ isOpen, onClose, onCreate, isCreating, createError }) => {
  const [articleFile, setArticleFile] = useState<File | null>(null);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  
  const handleCreate = () => {
    if (articleFile && assignmentFile) {
      onCreate(articleFile, assignmentFile);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <DocumentDuplicateIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Study Set</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                <XIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="p-8">
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Upload both the research article and the corresponding assignment questions in PDF format to begin your AI-tutored study session.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FileDropzone file={articleFile} onDrop={files => setArticleFile(files[0])} title="Article PDF" description="The main research paper." />
                <FileDropzone file={assignmentFile} onDrop={files => setAssignmentFile(files[0])} title="Assignment PDF" description="The list of questions." />
            </div>

            {createError && (
              <div className="mb-4 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p>{createError}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
                <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={handleCreate}
                    disabled={!articleFile || !assignmentFile || isCreating}
                    className="px-6 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                >
                    {isCreating ? (
                        <>
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        "Create & Start"
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
