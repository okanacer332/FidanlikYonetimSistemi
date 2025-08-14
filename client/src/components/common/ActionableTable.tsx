'use client';
import * as React from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  CircularProgress,
  alpha,
} from '@mui/material';
import { FileCsv, FilePdf, MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react';
import { saveAs } from 'file-saver';

export interface ColumnDef<T> {
  key: keyof T | 'actions' | string;
  header: string;
  getValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  width?: string | number;
  sortable?: boolean;
}

interface ActionableTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchTerm?: string;
  searchPlaceholder?: string;
  selectionEnabled?: boolean;
  selected?: string[];
  onSelectOne?: (item: string) => void;
  onDeselectOne?: (item: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  isLoading?: boolean;
  highlightedId?: string | null;
  order?: 'asc' | 'desc';
  orderBy?: string;
  onSort?: (property: string) => void;
  entity: string;
}

const flashAnimation = {
  '@keyframes flash': {
    'from': { backgroundColor: alpha('#4caf50', 0.3) },
    'to': { backgroundColor: 'transparent' },
  },
};

// YENİ: İngilizce entity adlarını Türkçe dosya adlarına çeviren sözlük
const entityNameMap: { [key: string]: string } = {
  'plants': 'fidan-kimlikleri',
  'customers': 'musteriler',
  'suppliers': 'tedarikciler',
  'warehouses': 'depolar',
  'expense-categories': 'gider-kategorileri',
  'inflation-data': 'enflasyon-verileri',
  'orders': 'siparisler',
  'goods-receipts': 'mal-girişi',
};


export function ActionableTable<T extends { id: string }>({
  columns,
  rows,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  searchTerm,
  searchPlaceholder = 'Tabloda ara...',
  selectionEnabled = true,
  selected,
  onSelectOne,
  onDeselectOne,
  onSelectAll,
  onDeselectAll,
  isLoading = false,
  highlightedId = null,
  order = 'asc',
  orderBy = '',
  onSort,
  entity,
}: ActionableTableProps<T>) {

  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/export/${format}?entity=${entity}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Dosya oluşturulurken sunucuda bir hata oluştu.');
      }

      const blob = await response.blob();
      
      // YENİ: Sözlüğü kullanarak Türkçe dosya adını alıyoruz.
      // Eğer sözlükte karşılığı yoksa, yine de İngilizce adını kullanır.
      const turkishEntityName = entityNameMap[entity] || entity;
      saveAs(blob, `${turkishEntityName}-raporu.${format}`);

    } catch (error) {
      console.error(`${format.toUpperCase()} indirilirken hata oluştu:`, error);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedSome = selected && selected.length > 0 && selected.length < rows.length;
  const selectedAll = selected && rows.length > 0 && selected.length === rows.length;

  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onSort?.(property);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Card>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Box>
            <TextField
              size="small"
              value={searchTerm}
              onChange={onSearch}
              placeholder={searchPlaceholder}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlassIcon fontSize="var(--icon-fontSize-sm)" />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: '300px',
                '.MuiInputBase-root': {
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>
          <Box>
            <Button onClick={() => handleExport('csv')} startIcon={<FileCsv />} size="small" disabled={isExporting}>CSV</Button>
            <Button onClick={() => handleExport('pdf')} startIcon={<FilePdf />} size="small" disabled={isExporting}>
              {isExporting ? 'Oluşturuluyor...' : 'PDF'}
            </Button>
          </Box>
        </Stack>
        <Divider />

        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }} size="small">
            <TableHead>
              <TableRow>
                {selectionEnabled && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={!!selectedAll}
                      indeterminate={!!selectedSome}
                      onChange={(event) => {
                        if (event.target.checked) {
                          onSelectAll?.();
                        } else {
                          onDeselectAll?.();
                        }
                      }}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    sx={{ width: col.width }}
                    sortDirection={orderBy === col.key ? order : false}
                  >
                    {col.sortable && onSort ? (
                      <TableSortLabel
                        active={orderBy === col.key}
                        direction={orderBy === col.key ? order : 'asc'}
                        onClick={createSortHandler(String(col.key))}
                      >
                        {col.header}
                      </TableSortLabel>
                    ) : (
                      col.header
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const isSelected = selected?.includes(row.id);
                const isHighlighted = row.id === highlightedId;

                return (
                  <TableRow
                    hover
                    key={row.id}
                    selected={selectionEnabled ? isSelected : false}
                    sx={{
                      ...flashAnimation,
                      ...(isHighlighted && {
                        animation: `flash 2s ease-out`,
                      }),
                    }}
                  >
                    {selectionEnabled && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              onDeselectOne?.(row.id);
                            } else {
                              onSelectOne?.(row.id);
                            }
                          }}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={`${String(col.key)}-${row.id}`}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: alpha('#ffffff', 0.7),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
            borderRadius: '20px',
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}