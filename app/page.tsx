import GitHubFileUploader from '@/components/GithubFileUploader'
import ProblemFile from '@/components/ProblemFile'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <h1>GitHub File Uploader</h1>
      {/* <GitHubFileUploader owner='adeshgg' repo='test-upload' branch='main' /> */}
      <ProblemFile />
    </main>
  )
}
