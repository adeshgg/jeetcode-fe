'use client'

import { useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import GitHubFileUploader from './GithubFileUploader'

const ProblemFile = () => {
  const [fileName, setFileName] = useState('')
  const [step, setStep] = useState(1)

  function handleUpload() {
    console.log('filename: ', fileName)

    if (fileName.length > 5) {
      setStep(2)
    } else setStep(1)
  }

  return (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      {step === 1 ? (
        <div>
          <Label htmlFor='filename'>File Name</Label>
          <Input
            type='text'
            value={fileName}
            id='filename'
            placeholder='Enter Filename'
            onChange={e => setFileName(e.target.value)}
            className='mb-1'
          />

          <Button onClick={handleUpload}>Upload File</Button>
        </div>
      ) : (
        <GitHubFileUploader
          fileName={fileName}
          owner='adeshgg'
          repo='test-upload'
          branch='main'
        />
      )}
    </div>
  )
}

export default ProblemFile
