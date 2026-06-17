import { useState, useEffect, useCallback } from 'react'
import { resumeAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, Trash2, Star, Download, CheckCircle } from 'lucide-react'

export default function ResumePage() {
  const [resumes, setResumes] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => { loadResumes() }, [])

  const loadResumes = async () => {
    try { const { data } = await resumeAPI.list(); setResumes(data) }
    catch { toast.error('Failed to load resumes') }
  }

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) setSelectedFile(files[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1
  })

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) { toast.error('Please enter a title and select a file'); return }
    setUploading(true)
    try {
      await resumeAPI.upload(title, selectedFile)
      toast.success('Resume uploaded!')
      setTitle(''); setSelectedFile(null); setShowForm(false)
      loadResumes()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Upload failed')
    } finally { setUploading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this resume?')) return
    try { await resumeAPI.delete(id); setResumes(prev => prev.filter(r => r.id !== id)); toast.success('Deleted') }
    catch { toast.error('Failed to delete') }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await resumeAPI.setDefault(id)
      setResumes(prev => prev.map(r => ({ ...r, is_default: r.id === id })))
      toast.success('Default resume updated')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
          <p className="text-gray-500 mt-1">Upload and manage your resume versions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload Resume
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Upload New Resume</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resume Title</label>
            <input className="input-field" placeholder="e.g. Software Engineer Resume 2024"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            {selectedFile ? (
              <div>
                <p className="font-medium text-green-600">{selectedFile.name}</p>
                <p className="text-sm text-gray-400 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 font-medium">Drop your resume here or click to browse</p>
                <p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX — Max 10MB</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleUpload} disabled={uploading || !selectedFile || !title.trim()} className="btn-primary">
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
            <button onClick={() => { setShowForm(false); setSelectedFile(null); setTitle('') }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No resumes yet</h3>
          <p className="text-gray-400 text-sm mb-4">Upload your resume to start applying for jobs</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Upload Your First Resume</button>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume: any) => (
            <div key={resume.id} className={`card flex items-center justify-between ${resume.is_default ? 'border-primary-200 bg-primary-50/30' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${resume.is_default ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <FileText className={`w-5 h-5 ${resume.is_default ? 'text-primary-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{resume.title}</p>
                    {resume.is_default && (
                      <span className="badge bg-primary-100 text-primary-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {resume.file_name} · {resume.file_size ? `${(resume.file_size / 1024).toFixed(0)} KB` : ''} · {new Date(resume.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!resume.is_default && (
                  <button onClick={() => handleSetDefault(resume.id)} title="Set as default"
                    className="p-2 text-gray-400 hover:text-amber-500 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <a href={resume.file_path} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </a>
                <button onClick={() => handleDelete(resume.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
