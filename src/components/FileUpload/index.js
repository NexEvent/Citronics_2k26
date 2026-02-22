import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Alert
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import { useTheme } from '@mui/material/styles'
import axios from 'axios'
import toast from 'react-hot-toast'
import NProgress from 'nprogress'
import Icon from 'src/components/Icon'

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/json': ['.json'],
  'text/csv': ['.csv']
}

const MAX_FILE_MB = 10
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024

/**
 * FileUpload
 * Generic drag-and-drop file upload dialog.
 *
 * Props:
 *  open           – dialog open state
 *  onClose        – close handler
 *  onUploadComplete(files) – called after all uploads succeed
 *  uploadEndpoint – API endpoint (default: /api/uploads)
 *  maxFileMB      – override max file size in MB
 *  accept         – override accepted MIME types
 *  title          – dialog title
 */
const FileUpload = ({
  open,
  onClose,
  onUploadComplete,
  uploadEndpoint = '/api/uploads',
  maxFileMB = MAX_FILE_MB,
  accept = ACCEPTED_TYPES,
  title = 'Upload Files'
}) => {
  const theme = useTheme()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({}) // { [fileId]: 0-100 }
  const [uploaded, setUploaded] = useState([])

  const maxBytes = maxFileMB * 1024 * 1024

  // ── Drop handler ───────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (accepted, rejected) => {
      rejected.forEach(({ file, errors }) =>
        errors.forEach((err) => {
          if (err.code === 'file-too-large')
            toast.error(`"${file.name}" exceeds ${maxFileMB} MB limit`)
          else if (err.code === 'file-invalid-type')
            toast.error(`"${file.name}" — unsupported file type`)
        })
      )

      setFiles((prev) => [
        ...prev,
        ...accepted.map((file) => ({
          file,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          status: 'pending'
        }))
      ])
    },
    [maxFileMB]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxBytes,
    multiple: true
  })

  // ── Remove pending file ────────────────────────────────────────────────────
  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id))

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    const pending = files.filter((f) => f.status === 'pending')
    if (!pending.length) return

    setUploading(true)
    NProgress.start()
    const results = []

    for (const item of pending) {
      const formData = new FormData()
      formData.append('file', item.file)

      // Mark as uploading
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f))
      )

      try {
        const { data } = await axios.post(uploadEndpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: ({ loaded, total }) => {
            setProgress((p) => ({ ...p, [item.id]: Math.round((loaded / total) * 100) }))
          }
        })

        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'done' } : f))
        )
        results.push(data)
        setUploaded((prev) => [...prev, data])
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'error', error: err.message } : f
          )
        )
        toast.error(`Failed to upload "${item.file.name}"`)
      }
    }

    NProgress.done()
    setUploading(false)

    if (results.length) {
      toast.success(`${results.length} file(s) uploaded successfully`)
      onUploadComplete?.(results)
    }
  }

  // ── Reset on close ─────────────────────────────────────────────────────────
  const handleClose = () => {
    if (uploading) return
    setFiles([])
    setProgress({})
    setUploaded([])
    onClose?.()
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const hasFiles = files.length > 0

  // ── Status chip helper ─────────────────────────────────────────────────────
  const statusChip = (status) => {
    const map = {
      pending: { label: 'Ready', color: 'default' },
      uploading: { label: 'Uploading', color: 'primary' },
      done: { label: 'Done', color: 'success' },
      error: { label: 'Error', color: 'error' }
    }
    const cfg = map[status] ?? map.pending
    return <Chip label={cfg.label} color={cfg.color} size="small" />
  }

  const formatBytes = (bytes) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <IconButton size="small" onClick={handleClose} disabled={uploading}>
          <Icon icon="tabler:x" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Drop zone */}
        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${
              isDragActive ? theme.palette.primary.main : theme.palette.divider
            }`,
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'primary.lighter' : 'background.paper',
            transition: 'all 0.2s ease',
            mb: 2,
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
          }}
        >
          <input {...getInputProps()} />
          <Icon icon="tabler:cloud-upload" fontSize={40} color={theme.palette.primary.main} />
          <Typography variant="body1" mt={1} fontWeight={500}>
            {isDragActive ? 'Drop files here…' : 'Drag & drop files or click to browse'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            Max {maxFileMB} MB per file — Images, PDF, Excel, CSV, JSON
          </Typography>
        </Box>

        {/* File list */}
        {hasFiles && (
          <List dense disablePadding>
            {files.map((item) => (
              <ListItem
                key={item.id}
                disableGutters
                secondaryAction={
                  item.status === 'pending' && (
                    <IconButton size="small" onClick={() => removeFile(item.id)}>
                      <Icon icon="tabler:x" fontSize={16} />
                    </IconButton>
                  )
                }
                sx={{ py: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Icon
                    icon={
                      item.file.type.startsWith('image/')
                        ? 'tabler:photo'
                        : item.file.type === 'application/pdf'
                        ? 'tabler:file-type-pdf'
                        : 'tabler:file'
                    }
                    fontSize={20}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item.file.name}
                  secondary={formatBytes(item.file.size)}
                  primaryTypographyProps={{ variant: 'body2', noWrap: true, maxWidth: 280 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <Box sx={{ ml: 1 }}>{statusChip(item.status)}</Box>

                {item.status === 'uploading' && (
                  <Box sx={{ width: '100%', mt: 0.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress[item.id] ?? 0}
                      sx={{ height: 4, borderRadius: 2 }}
                    />
                  </Box>
                )}

                {item.status === 'error' && (
                  <Alert severity="error" sx={{ mt: 0.5, py: 0, fontSize: 12 }}>
                    {item.error}
                  </Alert>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={uploading || pendingCount === 0}
          startIcon={<Icon icon="tabler:upload" />}
        >
          {uploading ? 'Uploading…' : `Upload${pendingCount ? ` (${pendingCount})` : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FileUpload
