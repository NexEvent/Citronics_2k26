/**
 * CustomDataGrid — Reusable data table component
 * Desktop: MUI Table with custom toolbar (search, sort)
 * Mobile:  Card-per-row responsive view with search
 *
 * Single source of truth for all tabular data in the application.
 * Columns use DataGrid-compatible format: { field, headerName, flex?, minWidth?, renderCell?, sortable? }
 */
import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Pagination from '@mui/material/Pagination'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { useTheme, alpha } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Icon from 'src/components/Icon'

/* ── Desktop Toolbar ── */
function TableToolbar({ search, onSearch }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: 2.5,
        py: 1.5,
        borderBottom: t => `1px solid ${t.palette.divider}`
      }}
    >
      <TextField
        size='small'
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder='Search…'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Icon icon='tabler:search' fontSize={16} />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position='end'>
              <IconButton size='small' onClick={() => onSearch('')} edge='end'>
                <Icon icon='tabler:x' fontSize={15} />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: { borderRadius: 2, fontSize: '0.875rem' }
        }}
        sx={{ minWidth: 220, maxWidth: 320 }}
      />
    </Box>
  )
}

/* ── Mobile Search Bar ── */
function MobileSearchBar({ value, onChange }) {
  return (
    <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
      <TextField
        fullWidth
        size='small'
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder='Search…'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Icon icon='tabler:search' fontSize={18} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position='end'>
              <IconButton size='small' onClick={() => onChange('')} edge='end'>
                <Icon icon='tabler:x' fontSize={16} />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: { borderRadius: 2 }
        }}
      />
    </Box>
  )
}

/* ── Mobile Card Row ── */
function MobileCard({ row, columns, theme, onClick }) {
  const actionCol = columns.find(c => c.field === 'actions')
  const dataCols = columns.filter(c => c.headerName && c.field !== 'actions')

  return (
    <Card
      variant='outlined'
      onClick={onClick}
      sx={{
        mb: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 2,
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: theme.shadows[2]
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {dataCols.map((col, i) => (
          <Box
            key={col.field}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 0.75,
              ...(i < dataCols.length - 1 && {
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
              })
            }}
          >
            <Typography
              variant='caption'
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                fontSize: '0.68rem',
                flexShrink: 0,
                minWidth: 80
              }}
            >
              {col.headerName}
            </Typography>
            <Box sx={{ textAlign: 'right', ml: 2, minWidth: 0, flex: 1 }}>
              {col.renderCell
                ? col.renderCell({ row, value: row[col.field] })
                : (
                  <Typography variant='body2' noWrap>
                    {row[col.field] ?? '—'}
                  </Typography>
                )}
            </Box>
          </Box>
        ))}

        {actionCol?.renderCell && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              pt: 1,
              mt: 0.5,
              borderTop: `1px solid ${theme.palette.divider}`
            }}
            onClick={e => e.stopPropagation()}
          >
            {actionCol.renderCell({ row, value: null })}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

/* ── Main Component ── */
const CustomDataGrid = ({
  rows = [],
  columns = [],
  loading = false,
  paginationModel = { page: 0, pageSize: 10 },
  onPaginationModelChange,
  pageSizeOptions = [10, 25, 50],
  paginationMode = 'server',
  rowCount = 0,
  showToolbar = true,
  emptyText = 'No records found.',
  onRowClick,
  getRowId = (row) => row.id,
  sx = {}
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = field => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filteredRows = useMemo(() => {
    if (!search) return rows
    const term = search.toLowerCase()
    return rows.filter(row =>
      columns.some(col => {
        const v = row[col.field]
        return v != null && String(v).toLowerCase().includes(term)
      })
    )
  }, [search, rows, columns])

  const sortedRows = useMemo(() => {
    if (!sortField || paginationMode === 'server') return filteredRows
    return [...filteredRows].sort((a, b) => {
      const av = a[sortField] ?? ''
      const bv = b[sortField] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filteredRows, sortField, sortDir, paginationMode])

  const totalRows = paginationMode === 'server' ? (rowCount || rows.length) : sortedRows.length
  const totalPages = Math.ceil(totalRows / paginationModel.pageSize)
  const pagedRows = paginationMode === 'server'
    ? sortedRows
    : sortedRows.slice(
        paginationModel.page * paginationModel.pageSize,
        (paginationModel.page + 1) * paginationModel.pageSize
      )

  /* ── Mobile View ── */
  if (isMobile) {
    const mobilePage = Math.ceil(filteredRows.length / paginationModel.pageSize)
    const mobilePagedRows = filteredRows.slice(
      paginationModel.page * paginationModel.pageSize,
      (paginationModel.page + 1) * paginationModel.pageSize
    )

    return (
      <Box>
        {showToolbar && <MobileSearchBar value={search} onChange={setSearch} />}
        <Box sx={{ px: 2, pb: 2 }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant='rectangular' height={100} sx={{ mb: 1.5, borderRadius: 2 }} />
            ))
          ) : mobilePagedRows.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Icon icon='tabler:database-off' fontSize={40} style={{ color: theme.palette.text.disabled }} />
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                {emptyText}
              </Typography>
            </Box>
          ) : (
            mobilePagedRows.map((row, idx) => {
              const rowId = typeof getRowId === 'function' ? getRowId(row) : (row.id ?? idx)
              return (
                <MobileCard
                  key={rowId}
                  row={row}
                  columns={columns}
                  theme={theme}
                  onClick={onRowClick ? () => onRowClick({ row }) : undefined}
                />
              )
            })
          )}
          {!loading && mobilePagedRows.length > 0 && (
            <Stack spacing={1.5} alignItems='center' sx={{ mt: 2 }}>
              <Pagination
                count={mobilePage}
                page={paginationModel.page + 1}
                onChange={(_, p) => onPaginationModelChange?.({ ...paginationModel, page: p - 1 })}
                color='primary'
                size='small'
                showFirstButton
                showLastButton
              />
              <Stack direction='row' alignItems='center' spacing={1}>
                <Typography variant='caption' color='text.secondary'>Rows per page:</Typography>
                <select
                  value={paginationModel.pageSize}
                  onChange={e => onPaginationModelChange?.({ page: 0, pageSize: Number(e.target.value) })}
                  style={{
                    padding: '4px 8px', borderRadius: 6,
                    border: `1px solid ${theme.palette.divider}`,
                    background: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    fontSize: '0.8rem', cursor: 'pointer'
                  }}
                >
                  {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>
    )
  }

  /* ── Desktop View ── */
  return (
    <Box sx={sx}>
      {showToolbar && <TableToolbar search={search} onSearch={setSearch} />}
      <TableContainer>
        <Table size='medium' sx={{ '& td, & th': { fontSize: '0.875rem' } }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.6)
                  : theme.palette.grey[50]
              }}
            >
              {columns.map(col => (
                <TableCell
                  key={col.field}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                    letterSpacing: '0.5px',
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                    minWidth: col.minWidth,
                    width: col.width,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  {col.sortable !== false && col.field !== 'actions' ? (
                    <TableSortLabel
                      active={sortField === col.field}
                      direction={sortField === col.field ? sortDir : 'asc'}
                      onClick={() => handleSort(col.field)}
                    >
                      {col.headerName}
                    </TableSortLabel>
                  ) : col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: paginationModel.pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map(col => (
                    <TableCell key={col.field}>
                      <Skeleton variant='text' height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ textAlign: 'center', py: 8, border: 'none' }}>
                  <Icon icon='tabler:database-off' fontSize={40} style={{ color: theme.palette.text.disabled }} />
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                    {emptyText}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row, idx) => {
                const rowId = typeof getRowId === 'function' ? getRowId(row) : (row.id ?? idx)
                return (
                  <TableRow
                    key={rowId}
                    hover
                    onClick={onRowClick ? () => onRowClick({ row }) : undefined}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:last-child td': { borderBottom: 'none' },
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
                    }}
                  >
                    {columns.map(col => (
                      <TableCell
                        key={col.field}
                        sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`, py: 1.25 }}
                      >
                        {col.renderCell
                          ? col.renderCell({ row, value: row[col.field] })
                          : (row[col.field] ?? '—')}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!loading && pagedRows.length > 0 && (
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          flexWrap='wrap'
          gap={1}
          sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Typography variant='caption' color='text.secondary'>
            {paginationMode === 'server'
              ? `${rowCount} total row${rowCount !== 1 ? 's' : ''}`
              : `${sortedRows.length} row${sortedRows.length !== 1 ? 's' : ''}`}
          </Typography>
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <Stack direction='row' alignItems='center' spacing={1}>
              <Typography variant='caption' color='text.secondary'>Rows per page:</Typography>
              <select
                value={paginationModel.pageSize}
                onChange={e => onPaginationModelChange?.({ page: 0, pageSize: Number(e.target.value) })}
                style={{
                  padding: '4px 8px', borderRadius: 6,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontSize: '0.8rem', cursor: 'pointer'
                }}
              >
                {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Stack>
            <Pagination
              count={totalPages}
              page={paginationModel.page + 1}
              onChange={(_, p) => onPaginationModelChange?.({ ...paginationModel, page: p - 1 })}
              color='primary'
              size='small'
              showFirstButton
              showLastButton
            />
          </Stack>
        </Stack>
      )}
    </Box>
  )
}

export default CustomDataGrid
