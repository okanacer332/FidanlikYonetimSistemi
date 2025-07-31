// src/components/common/ActionableTable.tsx (Tüm Özellikleri İçeren Nihai Hali)
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
  TextField,
} from '@mui/material';
import { FileCsv, FilePdf, MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Türkçe karakter destekli fontumuzu import ediyoruz.
import { robotoNormal } from '@/lib/fonts/Roboto-Regular-base64';

export interface ColumnDef<T> {
  key: keyof T | 'actions';
  header: string;
  getValue?: (row: T) => string | number; 
  render: (row: T) => React.ReactNode;
  width?: string | number;
}

interface ActionableTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  data: T[];
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
}

export function ActionableTable<T extends { id: string }>({
  columns,
  rows,
  data,
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
}: ActionableTableProps<T>) {

  const selectedSome = selected && selected.length > 0 && selected.length < rows.length;
  const selectedAll = selected && rows.length > 0 && selected.length === rows.length;

  const handleExportCSV = () => {
    const headers = columns.filter(c => c.key !== 'actions').map(c => c.header).join(',');
    const csvRows = data.map(row => 
      columns
        .filter(c => c.key !== 'actions')
        .map(c => {
          const value = c.getValue ? c.getValue(row) : (row[c.key as keyof T] as any)?.name || row[c.key as keyof T] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',')
    ).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,\uFEFF${headers}\n${csvRows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.addFileToVFS('Roboto-Regular.ttf', robotoNormal);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    const tableHeaders = columns.filter(c => c.key !== 'actions').map(c => c.header);
    const tableBody = data.map(row => 
      columns
        .filter(c => c.key !== 'actions')
        .map(c => String(c.getValue ? c.getValue(row) : (row[c.key as keyof T] as any)?.name || row[c.key as keyof T] || ''))
    );

    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      styles: { 
        font: 'Roboto', 
      },
      headStyles: {
        fontStyle: 'normal'
      }
    });

    doc.save('export.pdf');
  };

  return (
    <Card>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2 }}>
        {onSearch && (
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              value={searchTerm}
              onChange={onSearch}
              placeholder={searchPlaceholder}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: '500px' }}
            />
          </Box>
        )}
        <Button onClick={handleExportCSV} startIcon={<FileCsv />}>CSV</Button>
        <Button onClick={handleExportPDF} startIcon={<FilePdf />}>PDF</Button>
      </Stack>
      <Divider />
      
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              {selectionEnabled && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedAll}
                    indeterminate={selectedSome}
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
                <TableCell key={String(col.key)} sx={{ width: col.width }}>
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.includes(row.id);
              return (
                <TableRow hover key={row.id} selected={selectionEnabled ? isSelected : false}>
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
  );
}
