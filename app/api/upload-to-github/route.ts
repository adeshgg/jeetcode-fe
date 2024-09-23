import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

interface UploadRequestBody {
  fileName: string
  content: string
  owner: string
  repo: string
  branch?: string
}

export async function POST(request: NextRequest) {
  const {
    fileName,
    content,
    owner,
    repo,
    branch = 'main',
  }: UploadRequestBody = await request.json()
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    return NextResponse.json(
      { message: 'GitHub token is not configured' },
      { status: 500 }
    )
  }

  try {
    // Step 1: Get the current commit SHA
    const shaResponse = await axios.get<{ object: { sha: string } }>(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      { headers: { Authorization: `token ${token}` } }
    )
    const currentSHA = shaResponse.data.object.sha

    // Step 2: Create a new blob with the file content
    const blobResponse = await axios.post<{ sha: string }>(
      `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
      { content: Buffer.from(content).toString('base64'), encoding: 'base64' },
      { headers: { Authorization: `token ${token}` } }
    )
    const blobSHA = blobResponse.data.sha

    // Step 3: Create a new tree
    const treeResponse = await axios.post<{ sha: string }>(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        base_tree: currentSHA,
        tree: [{ path: fileName, mode: '100644', type: 'blob', sha: blobSHA }],
      },
      { headers: { Authorization: `token ${token}` } }
    )
    const treeSHA = treeResponse.data.sha

    // Step 4: Create a new commit
    const commitResponse = await axios.post<{ sha: string }>(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        message: `Upload ${fileName}`,
        tree: treeSHA,
        parents: [currentSHA],
      },
      { headers: { Authorization: `token ${token}` } }
    )
    const newCommitSHA = commitResponse.data.sha

    // Step 5: Update the reference
    await axios.patch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      { sha: newCommitSHA },
      { headers: { Authorization: `token ${token}` } }
    )

    return NextResponse.json({
      message: `File uploaded successfully @ https://github.com/${owner}/${repo}/blob/${branch}/${fileName}`,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { message: 'Error uploading file' },
      { status: 500 }
    )
  }
}
