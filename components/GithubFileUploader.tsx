'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

interface GitHubFileUploaderProps {
  owner: string
  repo: string
  branch?: string
}

interface FileStatus {
  name: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  message?: string
}

const GitHubFileUploader: React.FC<GitHubFileUploaderProps> = ({
  owner,
  repo,
  branch = 'main',
}) => {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFileStatuses = acceptedFiles.map(file => ({
        name: file.name,
        progress: 0,
        status: 'pending' as const,
      }))
      setFileStatuses(newFileStatuses)

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        try {
          setFileStatuses(prev =>
            prev.map((status, index) =>
              index === i ? { ...status, status: 'uploading' } : status
            )
          )

          const content = await file.text()
          const response = await axios.post(
            '/api/upload-to-github',
            {
              fileName: file.name,
              content,
              owner,
              repo,
              branch,
            },
            {
              onUploadProgress: progressEvent => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / (progressEvent.total ?? 100)
                )
                setFileStatuses(prev =>
                  prev.map((status, index) =>
                    index === i
                      ? { ...status, progress: percentCompleted }
                      : status
                  )
                )
              },
            }
          )

          setFileStatuses(prev =>
            prev.map((status, index) =>
              index === i
                ? {
                    ...status,
                    status: 'success',
                    message: response.data.message,
                  }
                : status
            )
          )
        } catch (error) {
          console.error('Error uploading file:', error)
          setFileStatuses(prev =>
            prev.map((status, index) =>
              index === i
                ? {
                    ...status,
                    status: 'error',
                    message: 'Error uploading file. Please try again.',
                  }
                : status
            )
          )
        }
      }
    },
    [owner, repo, branch]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div>
      <div {...getRootProps()} style={dropzoneStyles}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      {fileStatuses.map((file, index) => (
        <div key={index} style={fileStatusStyles}>
          <p>{file.name}</p>
          <div style={progressBarContainerStyles}>
            <div
              style={{
                ...progressBarStyles,
                width: `${file.progress}%`,
                backgroundColor:
                  file.status === 'success'
                    ? '#4CAF50'
                    : file.status === 'error'
                    ? '#F44336'
                    : '#2196F3',
              }}
            />
          </div>
          <p>
            {file.status === 'uploading' ? `${file.progress}%` : file.message}
          </p>
        </div>
      ))}
    </div>
  )
}

const dropzoneStyles: React.CSSProperties = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  marginBottom: '20px',
}

const fileStatusStyles: React.CSSProperties = {
  marginBottom: '10px',
}

const progressBarContainerStyles: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#e0e0e0',
  borderRadius: '4px',
  marginBottom: '5px',
}

const progressBarStyles: React.CSSProperties = {
  height: '10px',
  borderRadius: '4px',
  transition: 'width 0.3s ease-in-out',
}

export default GitHubFileUploader
