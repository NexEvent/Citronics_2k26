/**
 * CustomDataGrid — Admin portal data table
 * Desktop: MUI DataGrid with GridToolbar + QuickFilter
 * Mobile:  Card-per-row view with search
 *
 * Columns use DataGrid format: { field, headerName, flex?, minWidth?, renderCell?, sortable? }
 */
import { useState } from 'react'
import { DataGrid, GridToolbar, GridToolbarQuickFilter } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Pagination from '@mui/material/Pagination'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Icon from 'src/components/Icon'

function DesktopToolbar() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        px: 2,
        py: 1.5,
        borderBottom: theme => `1px solid ${theme.palette.divider}`
      }}
    >
      <GridToolbar
        sx={{ p: 0, '& .MuiButton-root': { fontSize: '0.8rem' } }}
        showQuickFilter={false}
        printOptions={{ disableToolbarButton: true }}
      />
      <GridToolbarQuickFilter
        debounceMs={300}
        sx={{ '& .MuiInputBase-root': { fontSize: '0.875rem' }, minWidth: 200 }}
      />
    </Box>
  )
}

function MobileToolbar({ value, onChange }) {
  return (
    <Box sx={{ px: 2, pt: 2, pb: 1 }}>
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
              <IconButton size='small' onClick={() => onChange('')}>
                <Icon icon='tabler:x' fontSize={16} />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
    </Box>
  )
}

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
  sx = {},
  ...otherProps
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileSearch, setMobileSearch] = useState('')

  const filteredRows = isMobile && mobileSearch
    ? rows.filter(row =>
        columns.some(col => {
          const v = row[col.field]
          return v != null && String(v).toLowerCase().includes(mobileSearch.toLowerCase())
        })
      )
    : rows

  /* ── Desktop ── */
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
        loading={loading}
        pageSizeOptions={pageSizeOptions}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        paginationMode={paginationMode}
        rowCount={rowCount}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        slots={{ toolbar: showToolbar ? DesktopToolbar : null }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: theme.palette.mode === 'dark'
              ? theme.palette.background.default
              : theme.palette.grey[50],
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            letterSpacing: '0.5px',
            color: theme.palette.text.secondary
          },
          '& .MuiDataGrid-columnSeparator': { display: 'none' },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${theme.palette.divider}`,
            fontSize: '0.875rem',
            outline: 'none !important'
          },
          '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${theme.palette.divider}`
          },
          ...sx
        }}
        {...otherProps}
      />
    )
  }

  /* ── Mobile ── */
  const totalPages = Math.ceil(
    (mobileSearch ? filteredRows.length : rowCount || rows.length) / paginationModel.pageSize
  )

  return (
    <Box>
      {showToolbar && <MobileToolbar value={mobileSearch} onChange={setMobileSearch} />}

      <Box sx={{ px: 2, pb: 2 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant='rectangular' height={120} sx={{ mb: 2, borderRadius: 2 }} />
          ))
        ) : filteredRows.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant='body2' color='text.secondary'>{emptyText}</Typography>
          </Box>
        ) : (
          filteredRows.map((row, idx) => (
            <Card
              key={row.id ?? idx}
              variant='outlined'
              sx={{
                mb: 2,
                '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                transition: 'box-shadow 0.15s, border-color 0.15s'
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {columns.map(col => {
                  if (!col.headerName || col.field === 'actions') return null
                  return (
                    <Box
                      key={col.field}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        py: 1,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        '&:last-of-type': { borderBottom: 'none', pb: 0 }
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{
                          fontWeight: 700,
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          minWidth: 90,
                          pt: '2px'
                        }}
                      >
                        {col.headerName}
                      </Typography>
                      <Box sx={{ textAlign: 'right', ml: 2, maxWidth: '60%' }}>
                        {col.renderCell
                          ? col.renderCell({ row, value: row[col.field] })
                          : <Typography variant='body2'>{row[col.field] ?? '—'}</Typography>
                        }
                      </Box>
                    </Box>
                  )
                })}

                {columns.find(c => c.field === 'actions') && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1.5, mt: 0.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                    {columns.find(c => c.field === 'actions')
                      .renderCell?.({ row, value: null })}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}

        {paginationMode === 'server' && !loading && filteredRows.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, mt: 1 }}>
            <Pagination
              count={totalPages}
              page={paginationModel.page + 1}
              onChange={(_, p) => onPaginationModelChange?.({ ...paginationModel, page: p - 1 })}
              color='primary'
              size='small'
              showFirstButton
              showLastButton
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='caption' color='text.secondary'>Rows per page:</Typography>
              <select
                value={paginationModel.pageSize}
                onChange={e => onPaginationModelChange?.({ page: 0, pageSize: Number(e.target.value) })}
                style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontSize: '0.8rem'
                }}
              >
                {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CustomDataGrid
