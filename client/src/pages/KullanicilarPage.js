// src/pages/KullanicilarPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ROLES_AND_PERMISSIONS, UPDATE_ROLE_PERMISSIONS } from '../graphql/roleQueries';
import { Box, Typography, Paper, CircularProgress, Alert, Checkbox, Button, Snackbar, Slide } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales'; // <-- 1. YENİ İMPORT
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// ... (Stateless) 'groupPermissions' fonksiyonu aynı kalıyor

const KullanicilarPage = () => {
    // ... (State ve mutation tanımları aynı kalıyor)
    const [selectedRole, setSelectedRole] = useState(null);
    const [checkedPermissions, setCheckedPermissions] = useState(new Set());
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
    const { data, loading, error } = useQuery(GET_ROLES_AND_PERMISSIONS);
    
    const [updateRole, { loading: updateLoading }] = useMutation(UPDATE_ROLE_PERMISSIONS, {
      onCompleted: () => {
          setSnackbar({ open: true, message: 'Rol başarıyla güncellendi!', severity: 'success' });
      },
      onError: (err) => {
          setSnackbar({ open: true, message: `Hata: ${err.message}`, severity: 'error' });
      },
      refetchQueries: [{ query: GET_ROLES_AND_PERMISSIONS }],
    });
  
    const [rows, setRows] = useState([]);
    const [initialRows, setInitialRows] = useState([]); 

    useEffect(() => {
        if (data) {
          const formattedRows = data.izinleriGetir.map(permission => {
            const row = {
              id: permission.id,
              description: permission.description,
            };
            data.rolleriGetir.forEach(role => {
              row[role.id] = role.permissions.some(p => p.id === permission.id);
            });
            return row;
          });
          setRows(formattedRows);
          setInitialRows(JSON.parse(JSON.stringify(formattedRows))); 
        }
      }, [data]);
      
      const columns = useMemo(() => {
        if (!data?.rolleriGetir) return [];
        
        const baseColumns = [{ field: 'description', headerName: 'Yetki Açıklaması', width: 250, editable: false }];
        
        const roleColumns = data.rolleriGetir.map(role => ({
          field: role.id,
          headerName: role.name,
          width: 150,
          align: 'center',
          headerAlign: 'center',
          renderCell: (params) => (
            <Checkbox
              checked={params.value}
              onChange={(event) => {
                setRows(currentRows =>
                  currentRows.map(row =>
                    row.id === params.id ? { ...row, [role.id]: event.target.checked } : row
                  )
                );
              }}
            />
          ),
        }));
    
        return [...baseColumns, ...roleColumns];
      }, [data]);
    
      const handleSaveChanges = async () => {
        const changedRoles = {};
    
        rows.forEach((row, rowIndex) => {
            const initialRow = initialRows[rowIndex];
            Object.keys(row).forEach(key => {
                if (key !== 'id' && key !== 'description' && row[key] !== initialRow[key]) {
                    if (!changedRoles[key]) {
                        changedRoles[key] = [];
                    }
                    rows.forEach(r => {
                        if (r[key]) {
                            changedRoles[key].push(r.id);
                        }
                    });
                }
            });
        });
    
        try {
            const updatePromises = Object.keys(changedRoles).map(roleId => {
                const uniquePermissions = [...new Set(changedRoles[roleId])];
                return updateRole({ variables: { roleId, permissionIds: uniquePermissions } });
            });
            
            await Promise.all(updatePromises);
    
            setSnackbar({ open: true, message: 'Tüm değişiklikler başarıyla kaydedildi!', severity: 'success' });
            setInitialRows(JSON.parse(JSON.stringify(rows)));
        } catch (err) {
            setSnackbar({ open: true, message: `Hata: ${err.message}`, severity: 'error' });
        }
      };

    const hasChanges = JSON.stringify(rows) !== JSON.stringify(initialRows);

    if (loading) return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
    if (error) return <Alert severity="error">Veri çekilirken hata oluştu: {error.message}</Alert>;


  return (
    <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
                <Typography variant="h4" fontWeight="bold">Rol ve Yetki Yönetimi</Typography>
                <Typography variant="body1" color="text.secondary">
                    Checkbox'lara tıklayarak rollere yetki atayın veya kaldırın. İşiniz bittiğinde 'Kaydet' butonuna basın.
                </Typography>
            </Box>
            {hasChanges && (
                <Button variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={handleSaveChanges} disabled={updateLoading}>
                    {updateLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
            )}
        </Box>
      <Paper elevation={3} sx={{ mt: 2, height: '70vh', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          localeText={trTR.components.MuiDataGrid.defaultProps.localeText} // <-- 2. YENİ PROP
        />
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})} TransitionComponent={Slide} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert icon={snackbar.severity === 'success' ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KullanicilarPage;