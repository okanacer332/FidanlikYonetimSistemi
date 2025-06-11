// src/pages/FidanlarPage.js
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Typography, Button, CircularProgress, Alert, Paper, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales';

// İkonlar
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';

// GraphQL Operasyonları ve Form Bileşeni
import { GET_FIDAN_TREE, ADD_FIDAN, UPDATE_FIDAN, DELETE_FIDAN } from '../graphql/fidanQueries';
import FidanFormModal from '../components/FidanFormModal';

const FidanlarPage = () => {
  // --- STATE'LER ---
  const { data, loading, error, refetch } = useQuery(GET_FIDAN_TREE);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [modal, setModal] = useState({ open: false, type: 'add', data: null });
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null });

  // --- MUTASYONLAR ---
  const [addFidan, { loading: addLoading }] = useMutation(ADD_FIDAN, { onCompleted: () => refetch() });
  const [updateFidan, { loading: updateLoading }] = useMutation(UPDATE_FIDAN);
  const [deleteFidan, { loading: deleteLoading }] = useMutation(DELETE_FIDAN, { onCompleted: () => refetch() });


  // --- FONKSİYONLAR ---
  const handleOpenModal = (type, data = null) => {
    setModal({ open: true, type, data });
    handleCloseContextMenu();
  };
  const handleCloseModal = () => setModal({ open: false, type: 'add', data: null });

  const handleSave = (name) => {
    if (modal.type === 'add') {
      addFidan({ variables: { input: { name, parentId: modal.data?.id || null } } });
    } else if (modal.type === 'edit') {
      updateFidan({ variables: { id: modal.data.id, name } });
    }
    handleCloseModal();
  };
  
  const handleDeleteRequest = (item) => {
    setDeleteConfirm({ open: true, item });
    handleCloseContextMenu();
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.item) {
      deleteFidan({ variables: { id: deleteConfirm.item.id } })
        .catch(err => alert(err.message))
        .finally(() => setDeleteConfirm({ open: false, item: null }));
    }
  };

  const toggleNode = (id) => {
    const newExpanded = new Set(expandedItems);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedItems(newExpanded);
  };
  
  const handleContextMenu = (event, row) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, row } : null,
    );
  };
  const handleCloseContextMenu = () => setContextMenu(null);

  // --- DATA VE KOLONLAR ---
  const visibleRows = useMemo(() => {
    const rows = [];
    const buildRows = (items, depth) => {
      if (!items) return;
      items.forEach(item => {
        rows.push({ ...item, depth });
        if (item.children && expandedItems.has(item.id)) {
          buildRows(item.children, depth + 1);
        }
      });
    };
    buildRows(data?.fidanTreeGetir || [], 0);
    return rows;
  }, [data, expandedItems]);

  const columns = [
    {
      field: 'name',
      headerName: 'Fidan / Kategori Adı',
      minWidth: 300,
      flex: 1,
      renderCell: (params) => (
        <Box 
          sx={{ display: 'flex', alignItems: 'center', paddingLeft: `${params.row.depth * 24}px` }}
          onContextMenu={(e) => handleContextMenu(e, params.row)} // Sağ tık olayını yakala
          style={{ cursor: 'context-menu' }}
        >
          {params.row.children?.length > 0 ? (
            <IconButton size="small" onClick={() => toggleNode(params.row.id)} sx={{ mr: 1 }}>
              {expandedItems.has(params.row.id) ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
          ) : ( <Box sx={{ width: 28, mr: 1 }} /> )}
          {params.value}
        </Box>
      )
    },
    // Diğer kolonları sadeleştirdik
  ];

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  if (error) return <Alert severity="error">Fidanlar çekilirken hata oluştu: {error.message}</Alert>;

  return (
    <>
      <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" fontWeight="bold">Fidan Kataloğu</Typography>
              <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenModal('add', null)}>
                Yeni Ana Kategori
              </Button>
          </Box>
          <Paper elevation={3} sx={{ mt: 2, height: '75vh', width: '100%' }}>
              <DataGrid
                  rows={visibleRows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  hideFooterSelectedRowCount // Alt bardaki "x satır seçildi" yazısını gizle
                  disableColumnMenu // Kolon menülerini şimdilik kapatalım
                  // Sağ tık menüsünü DataGrid'in kendi menüsüyle çakışmaması için kapatıyoruz
                  disableRowSelectionOnClick
                  componentsProps={{
                    row: {
                      onContextMenu: (e) => {
                          const id = e.currentTarget.dataset.id;
                          const row = visibleRows.find(r => r.id === id);
                          if(row) handleContextMenu(e, row);
                      },
                      style: { cursor: 'context-menu' },
                    },
                  }}
                  localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
              />
          </Paper>
      </Box>

      {/* Ortak Ekle/Düzenle Formu */}
      <FidanFormModal 
        open={modal.open}
        onClose={handleCloseModal}
        onSave={handleSave}
        loading={addLoading || updateLoading}
        initialData={modal.type === 'edit' ? modal.data : null}
      />

      {/* Sağ Tık Menüsü */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={ contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined }
      >
        <MenuItem onClick={() => handleOpenModal('edit', contextMenu?.row)}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>İsmini Düzenle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenModal('add', contextMenu?.row)}>
            <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Alt Eleman Ekle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteRequest(contextMenu?.row)} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>

      {/* Silme Onay Penceresi */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, item: null })}>
        <DialogTitle>Öğeyi Silmeyi Onayla</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <b>{deleteConfirm.item?.name}</b> adlı öğeyi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDeleteConfirm({ open: false, item: null })}>İptal</Button>
            <Button onClick={handleDeleteConfirm} color="error" disabled={deleteLoading}>
                {deleteLoading ? 'Siliniyor...' : 'Evet, Sil'}
            </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FidanlarPage;