'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

interface GitHubFileUploaderProps {
  owner: string
  repo: string
  branch?: string
}

const GitHubFileUploader: React.FC<GitHubFileUploaderProps> = ({
  owner,
  repo,
  branch = 'main',
}) => {
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploadStatus('Uploading...')

      try {
        const content = await file.text()
        const response = await axios.post('/api/upload-to-github', {
          fileName: file.name,
          content,
          owner,
          repo,
          branch,
        })

        setUploadStatus(response.data.message)
      } catch (error) {
        console.error('Error uploading file:', error)
        setUploadStatus('Error uploading file. Please try again.')
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
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag 'n' drop a file here, or click to select a file</p>
        )}
      </div>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  )
}

const dropzoneStyles: React.CSSProperties = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
}

export default GitHubFileUploader
