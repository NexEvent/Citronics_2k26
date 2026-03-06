/**
 * CustomDataGrid — Reusable data table component
 * Desktop: MUI DataGrid with built-in GridToolbar (filter, column toggle, density, search)
 * Mobile:  Card-per-row responsive view with search
 *
 * Single source of truth for all tabular data in the application.
 * Columns use DataGrid format: { field, headerName, flex?, minWidth?, renderCell?, sortable? }
 */
import { useState, useCallback } from 'react'
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter
} from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CustomTextField from 'src/components/mui/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Pagination from '@mui/material/Pagination'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { useTheme, alpha } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Icon from 'src/components/Icon'

/* ── Desktop Toolbar ── */
function GridToolbar() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        px: 2.5,
        py: 1.5,
        borderBottom: t => `1px solid ${t.palette.divider}`
      }}
    >
      <Stack direction='row' spacing={0.5} alignItems='center'>
        <GridToolbarColumnsButton sx={{ fontSize: '0.8rem' }} />
        <GridToolbarFilterButton sx={{ fontSize: '0.8rem' }} />
        <GridToolbarDensitySelector sx={{ fontSize: '0.8rem' }} />
      </Stack>
      <GridToolbarQuickFilter
        debounceMs={300}
        sx={{
          '& .MuiInputBase-root': { fontSize: '0.875rem', borderRadius: 2 },
          minWidth: 220,
          maxWidth: 320
        }}
        placeholder='Search…'
      />
    </Box>
  )
}

/* ── Mobile Search Bar ── */
function MobileSearchBar({ value, onChange }) {
  return (
    <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
      <CustomTextField
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
          ) : null
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
  disableRowSelectionOnClick = true,
  showToolbar = true,
  emptyText = 'No records found.',
  onRowClick,
  getRowId = (row) => row.id,
  sx = {},
  ...otherProps
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileSearch, setMobileSearch] = useState('')

  const handleMobileSearch = useCallback((val) => {
    setMobileSearch(val)
    onPaginationModelChange?.({ ...paginationModel, page: 0 })
  }, [onPaginationModelChange, paginationModel])

  const filteredRows = useCallback(() => {
    if (!isMobile || !mobileSearch) return rows

    const term = mobileSearch.toLowerCase()

    return rows.filter(row =>
      columns.some(col => {
        const v = row[col.field]

        return v != null && String(v).toLowerCase().includes(term)
      })
    )
  }, [isMobile, mobileSearch, rows, columns])

  /* ── Desktop View ── */
  if (!isMobile) {
    return (
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns.map(c => ({
          sortable: true,
          disableColumnMenu: false,
          ...c
        }))}
        getRowId={getRowId}
        loading={loading}
        pageSizeOptions={pageSizeOptions}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        paginationMode={paginationMode}
        rowCount={rowCount}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        onRowClick={onRowClick}
        slots={{ toolbar: showToolbar ? GridToolbar : null }}
        rowHeight={56}
        sx={{
          border: 'none',

          /* Column Headers */
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.6)
              : theme.palette.grey[50],
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            letterSpacing: '0.5px',
            color: theme.palette.text.secondary,
            borderBottom: `1px solid ${theme.palette.divider}`
          },
          '& .MuiDataGrid-columnSeparator': { display: 'none' },

          /* Cells */
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            fontSize: '0.875rem',
            py: 1,
            display: 'flex',
            alignItems: 'center',
            outline: 'none !important'
          },

          /* Rows */
          '& .MuiDataGrid-row': {
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.04)
            },
            '&:last-of-type .MuiDataGrid-cell': {
              borderBottom: 'none'
            }
          },

          /* Footer */
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${theme.palette.divider}`
          },

          /* Overlay */
          '& .MuiDataGrid-overlayWrapper': {
            minHeight: 200
          },
          ...sx
        }}
        {...otherProps}
      />
    )
  }

  /* ── Mobile View ── */
  const isServerMode = paginationMode === 'server'
  const visibleRows = filteredRows()

  const totalCount = isServerMode ? rowCount : visibleRows.length
  const totalPages = Math.max(1, Math.ceil(totalCount / paginationModel.pageSize))
  const safePage = Math.min(paginationModel.page, Math.max(0, totalPages - 1))

  const pagedRows = isServerMode
    ? visibleRows
    : visibleRows.slice(
        safePage * paginationModel.pageSize,
        (safePage + 1) * paginationModel.pageSize
      )

  return (
    <Box>
      {showToolbar && !isServerMode && <MobileSearchBar value={mobileSearch} onChange={handleMobileSearch} />}

      <Box sx={{ px: 2, pb: 2 }}>
        {/* Loading */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              variant='rectangular'
              height={100}
              sx={{ mb: 1.5, borderRadius: 2 }}
            />
          ))
        ) : pagedRows.length === 0 ? (
          /* Empty */
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Icon icon='tabler:database-off' fontSize={40} style={{ color: theme.palette.text.disabled }} />
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              {emptyText}
            </Typography>
          </Box>
        ) : (
          /* Cards */
          pagedRows.map((row, idx) => {
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

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <Stack spacing={1.5} alignItems='center' sx={{ mt: 2 }}>
            <Pagination
              count={totalPages}
              page={safePage + 1}
              onChange={(_, p) => onPaginationModelChange?.({ ...paginationModel, page: p - 1 })}
              color='primary'
              size='small'
              showFirstButton
              showLastButton
            />
            <Stack direction='row' alignItems='center' spacing={1}>
              <Typography variant='caption' color='text.secondary'>
                Rows per page:
              </Typography>
              <select
                value={paginationModel.pageSize}
                onChange={e =>
                  onPaginationModelChange?.({ page: 0, pageSize: Number(e.target.value) })
                }
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {pageSizeOptions.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default CustomDataGrid