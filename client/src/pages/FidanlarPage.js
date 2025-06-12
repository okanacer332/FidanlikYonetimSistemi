// src/pages/FidanlarPage.js
import React, { useState, useMemo, useCallback, useEffect } from 'react'; // useEffect eklendi
import { useQuery, useMutation } from '@apollo/client';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper, IconButton, Snackbar, Slide,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField,
  useMediaQuery, useTheme
} from '@mui/material';
import { DataGrid, GridActionsCellItem, GridToolbar } from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales';

// İkonlar
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// GraphQL Operasyonları ve Form Bileşeni
import { GET_FIDAN_TREE, ADD_FIDAN, UPDATE_FIDAN, DELETE_FIDAN } from '../graphql/fidanQueries';
import FidanFormModal from '../components/FidanFormModal';

const FidanlarPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // --- STATE'LER ---
  const { data, loading, error, refetch } = useQuery(GET_FIDAN_TREE);
  const [expandedItems, setExpandedItems] = useState(new Set()); // Genişletilmiş öğelerin ID'lerini tutar
  const [modal, setModal] = useState({ open: false, type: 'add', data: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Kategori filtreleme state'leri
  const [filters, setFilters] = useState({
    anaKategori: '',
    altKategori: '',
    cins: '',
  });

  // --- MUTASYONLAR ---
  const [addFidan, { loading: addLoading }] = useMutation(ADD_FIDAN, {
    onCompleted: () => {
      refetch();
      setSnackbar({ open: true, message: 'Fidan/Kategori başarıyla eklendi!', severity: 'success' });
    },
    onError: (err) => {
      setSnackbar({ open: true, message: `Hata: ${err.message}`, severity: 'error' });
    }
  });

  const [updateFidan, { loading: updateLoading }] = useMutation(UPDATE_FIDAN, {
    onCompleted: () => {
      refetch();
      setSnackbar({ open: true, message: 'Fidan/Kategori başarıyla güncellendi!', severity: 'success' });
    },
    onError: (err) => {
      setSnackbar({ open: true, message: `Hata: ${err.message}`, severity: 'error' });
    }
  });

  const [deleteFidan, { loading: deleteLoading }] = useMutation(DELETE_FIDAN, {
    onCompleted: () => {
      refetch();
      setSnackbar({ open: true, message: 'Fidan/Kategori başarıyla silindi!', severity: 'success' });
      const newExpanded = new Set(expandedItems);
      const removeChildrenFromExpanded = (parentId, currentItems) => {
          newExpanded.delete(parentId);
          const directChildren = currentItems.filter(item => String(item.parentId) === String(parentId));
          directChildren.forEach(child => removeChildrenFromExpanded(child.id, currentItems));
      };
      const allFidanlarFlat = [];
      const flattenTree = (nodes) => {
        nodes.forEach(node => {
          allFidanlarFlat.push(node);
          if (node.children) flattenTree(node.children);
        });
      };
      flattenTree(data?.fidanTreeGetir || []);
      removeChildrenFromExpanded(deleteConfirm.item.id, allFidanlarFlat);
      setExpandedItems(newExpanded);
    },
    onError: (err) => {
      setSnackbar({ open: true, message: `Hata: ${err.message}`, severity: 'error' });
    }
  });


  // --- FONKSİYONLAR ---
  const handleOpenModal = (type, data = null) => {
    setModal({ open: true, type, data });
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
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.item) {
      deleteFidan({ variables: { id: deleteConfirm.item.id } })
        .finally(() => setDeleteConfirm({ open: false, item: null }));
    }
  };

  // Sekme yönetimi: Sadece tıklanan düğümü genişletir/daraltır, diğerlerini etkilemez.
  const toggleNode = useCallback((id) => {
    setExpandedItems(prev => {
      const newExpanded = new Set(prev); // Önceki genişletilmiş öğeleri kopyala
      if (newExpanded.has(id)) {
        newExpanded.delete(id); // Eğer zaten genişletilmişse, daralt
      } else {
        newExpanded.add(id); // Eğer daraltılmışsa, genişlet
      }
      return newExpanded;
    });
  }, []);
  
  const handleRowClick = (params) => {
    // Eylem (actions) sütununa tıklanmadığı sürece genişlet/daralt yap
    if (params.field !== 'actions' && params.row.children?.length > 0) {
      toggleNode(params.row.id);
    }
  };

  const handleProcessRowUpdate = async (newRow, oldRow) => {
    if (newRow.name !== oldRow.name) {
      try {
        const { data } = await updateFidan({ variables: { id: newRow.id, name: newRow.name } });
        return { ...newRow, name: data.fidanGuncelle.name };
      } catch (error) {
        return oldRow;
      }
    }
    return newRow;
  };

  // Kategori filtrelerinin değişimi
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Kategori filtrelerinin aktif olup olmadığını kontrol eden memoized değer
  const areAnySpecificFiltersActive = useMemo(() => {
    return !!filters.anaKategori || !!filters.altKategori || !!filters.cins;
  }, [filters]);


  // useEffect: Filtreler değiştiğinde otomatik olarak genişletilecek dalları ayarla
  useEffect(() => {
    if (!data) return;

    const idsToAutoExpand = new Set(); // Filtreye göre otomatik genişletilecek ID'ler

    // Recursive fonksiyon: filtreye uyan düğümlerin ve üst öğelerinin ID'lerini toplar
    const collectParentIdsForExpansion = (nodes, currentDepth) => {
        let anyChildMatch = false; // Bu daldaki herhangi bir alt öğe eşleşti mi?

        nodes.forEach(node => {
            const nodeNameLower = node.name.toLowerCase();
            let nodeMatchesThisFilter = false; // Bu node kendi spesifik filtresine uyuyor mu?

            // Bu node'un kendi filtre koşulunu kontrol et
            if (currentDepth === 0 && filters.anaKategori) {
                nodeMatchesThisFilter = nodeNameLower.includes(filters.anaKategori.toLowerCase());
            } else if (currentDepth === 1 && filters.altKategori) {
                nodeMatchesThisFilter = nodeNameLower.includes(filters.altKategori.toLowerCase());
            } else if (currentDepth === 2 && filters.cins) {
                nodeMatchesThisFilter = nodeNameLower.includes(filters.cins.toLowerCase());
            }
            // Daha derin seviyelerdeki node'lar (3. seviye ve sonrası) için özel bir kategori filtresi yoktur.
            // Onların görünürlüğü üst kategorileri (cins) tarafından belirlenir.

            // Alt öğelerdeki eşleşmeleri kontrol et ve eğer varsa ID'leri topla
            const childrenMatchedAndCollected = node.children ? collectParentIdsForExpansion(node.children, currentDepth + 1) : false;

            // Eğer bu node kendi filtresine uyuyorsa VEYA herhangi bir alt öğesi eşleşiyorsa
            if (nodeMatchesThisFilter || childrenMatchedAndCollected) {
                idsToAutoExpand.add(node.id); // Bu node'u otomatik genişletme listesine ekle
                anyChildMatch = true; // Üst parent'a bir eşleşme bulunduğunu bildir
            }
        });
        return anyChildMatch; // Bu daldan yukarıya bir eşleşme bildir
    };

    const initialRootItems = data?.fidanTreeGetir.filter(item => !item.parentId) || [];
    
    // Eğer herhangi bir kategori filtresi aktifse, otomatik genişletilecek ID'leri topla
    if (areAnySpecificFiltersActive) {
        collectParentIdsForExpansion(initialRootItems, 0);
        setExpandedItems(idsToAutoExpand); // expandedItems'ı filtreye göre ayarla
    } else {
        // Eğer kategori filtreleri temizlenirse, tüm sekmeleri kapat (otomatik genişletmeleri sıfırla)
        setExpandedItems(new Set());
    }

  }, [data, filters, areAnySpecificFiltersActive]); // Bağımlılıklar: data, filters state'i, areAnySpecificFiltersActive

  // --- DATA VE KOLONLAR ---
  const visibleRows = useMemo(() => {
    const rows = [];
    
    // Recursive filtreleme fonksiyonu (useEffect'ten farklı, bu görünür satırları oluşturur)
    const filterTreeForDisplay = (nodes, currentDepth) => {
        const filteredNodes = [];
        nodes.forEach(node => {
            const nodeNameLower = node.name.toLowerCase();
            let nodePassesSpecificFilter = false; 

            // Eğer hiçbir kategori filtresi aktif değilse, tüm node'lar başlangıçta filtreyi geçiyor sayılır.
            if (!areAnySpecificFiltersActive) {
                nodePassesSpecificFilter = true;
            } else {
                if (currentDepth === 0 && filters.anaKategori) {
                    nodePassesSpecificFilter = nodeNameLower.includes(filters.anaKategori.toLowerCase());
                } else if (currentDepth === 1 && filters.altKategori) {
                    nodePassesSpecificFilter = nodeNameLower.includes(filters.altKategori.toLowerCase());
                } else if (currentDepth === 2 && filters.cins) {
                    nodePassesSpecificFilter = nodeNameLower.includes(filters.cins.toLowerCase());
                }
            }

            const childrenFilteredForDisplay = node.children ? filterTreeForDisplay(node.children, currentDepth + 1) : [];

            if (nodePassesSpecificFilter || childrenFilteredForDisplay.length > 0) {
                filteredNodes.push({ ...node, children: childrenFilteredForDisplay });
            }
        });
        return filteredNodes;
    };

    const initialRootItems = data?.fidanTreeGetir.filter(item => !item.parentId) || [];
    const filteredTreeDataForDisplay = filterTreeForDisplay(initialRootItems, 0);

    const flattenFilteredTree = (nodes, currentDepth) => {
      const sortedNodes = [...nodes].sort((a, b) => a.name.localeCompare(b.name));
      sortedNodes.forEach(node => {
        rows.push({ ...node, depth: currentDepth });
        // expandedItems setini kullanarak sadece genişletilmiş öğelerin çocuklarını düzleştir
        if (expandedItems.has(node.id) && node.children && node.children.length > 0) {
          flattenFilteredTree(node.children, currentDepth + 1);
        }
      });
    };

    flattenFilteredTree(filteredTreeDataForDisplay, 0);

    return rows;
  }, [data, expandedItems, filters, areAnySpecificFiltersActive]); // Bağımlılıklar güncellendi

  const columns = [
    {
      field: 'name',
      headerName: 'Fidan / Kategori Adı',
      minWidth: 300,
      flex: 1,
      editable: true,
      sortable: false, // Otomatik sıralamayı kapat
      renderCell: (params) => (
        <Box
          sx={{ display: 'flex', alignItems: 'center', paddingLeft: `${params.row.depth * 24}px` }}
        >
          {/* Sadece çocukları olanlar için ok butonu göster */}
          {params.row.children && params.row.children.length > 0 ? (
            <IconButton size="small" onClick={() => toggleNode(params.row.id)} sx={{ mr: 1 }}>
              {expandedItems.has(params.row.id) ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
            </IconButton>
          ) : ( <Box sx={{ width: 28, mr: 1 }} /> )}
          <Typography>{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: isSmallScreen ? 100 : 150, // Küçük ekranlar için genişlik ayarı
      sortable: false,
      filterable: false,
      renderCell: (params) => ( // getActions yerine renderCell kullanarak butonları direkt göster
        <Box sx={{ display: 'flex', gap: 0.5 }}>
            {params.row.depth < 2 && ( // 0. ve 1. derinlikteki öğelere alt eleman eklenir (toplam 3 seviye için)
                <IconButton aria-label="Alt Eleman Ekle" size="small" onClick={() => handleOpenModal('add', params.row)} title="Alt Eleman Ekle">
                    <AddIcon fontSize="small" />
                </IconButton>
            )}
            <IconButton aria-label="Düzenle" size="small" onClick={() => handleOpenModal('edit', params.row)} title="Düzenle">
                <EditIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="Sil" size="small" onClick={() => handleDeleteRequest(params.row)} color="error" title="Sil">
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Box>
      )
    },
  ];

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '100px auto' }} />;
  if (error) return <Alert severity="error">Fidanlar çekilirken hata oluştu: {error.message}</Alert>;

  return (
    <>
      <Box sx={{ p: isSmallScreen ? 1 : 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexDirection: isSmallScreen ? 'column' : 'row', gap: isSmallScreen ? 2 : 0 }}>
              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" sx={{ textAlign: isSmallScreen ? 'center' : 'left' }}>Fidan Kataloğu</Typography>
              <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenModal('add', null)} fullWidth={isSmallScreen}>
                Yeni Ana Kategori Ekle
              </Button>
          </Box>

          {/* Kategori Filtreleme Alanları */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: isSmallScreen ? 'column' : 'row' }}>
            <TextField
              label="Ana Kategori Ara"
              name="anaKategori"
              value={filters.anaKategori}
              onChange={handleFilterChange}
              fullWidth={isSmallScreen}
              size="small"
              variant="outlined"
            />
            <TextField
              label="Alt Kategori Ara"
              name="altKategori"
              value={filters.altKategori}
              onChange={handleFilterChange}
              fullWidth={isSmallScreen}
              size="small"
              variant="outlined"
            />
            <TextField
              label="Cins Ara"
              name="cins"
              value={filters.cins}
              onChange={handleFilterChange}
              fullWidth={isSmallScreen}
              size="small"
              variant="outlined"
            />
          </Box>

          <Paper elevation={3} sx={{ mt: 2, height: '75vh', width: '100%', minHeight: '400px' }}>
              <DataGrid
                  rows={visibleRows}
                  columns={columns}
                  getRowId={(row) => row.id}
                  hideFooterSelectedRowCount
                  disableColumnMenu
                  disableRowSelectionOnClick
                  processRowUpdate={handleProcessRowUpdate}
                  onProcessRowUpdateError={(error) => setSnackbar({ open: true, message: `Güncelleme hatası: ${error.message}`, severity: 'error' })}
                  onRowClick={handleRowClick}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { placeholder: 'Tüm Fidanlarda Genel Ara...', debounceMs: 500 } } }}
                  localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
                  sortModel={[]}
                  onSortModelChange={() => {}}
                  density="standard"
                  sx={{
                      '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: '#f5f5f5',
                          fontWeight: 'bold',
                      },
                      '& .MuiDataGrid-cell': {
                          paddingY: '8px',
                          borderRight: '1px solid #e0e0e0',
                      },
                      '& .MuiDataGrid-columnHeader:last-child .MuiDataGrid-columnSeparator': {
                          display: 'none',
                      },
                      '& .MuiDataGrid-cell:last-child': {
                          borderRight: 'none',
                      },
                      '& .MuiDataGrid-row': {
                          '&:hover': {
                              backgroundColor: '#e8e8e8',
                          },
                          cursor: 'pointer',
                      },
                      '& .MuiDataGrid-columnHeader': {
                          borderRight: '1px solid #e0e0e0',
                      },
                  }}
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

      {/* Silme Onay Penceresi */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, item: null })}>
        <DialogTitle>Öğeyi Silmeyi Onayla</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <b>{deleteConfirm.item?.name}</b> adlı öğeyi ve **tüm alt elemanlarını** kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDeleteConfirm({ open: false, item: null })}>İptal</Button>
            <Button onClick={handleDeleteConfirm} color="error" disabled={deleteLoading}>
                {deleteLoading ? 'Siliniyor...' : 'Evet, Sil'}
            </Button>
        </DialogActions>
      </Dialog>

      {/* İşlem Sonucu Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})} TransitionComponent={Slide} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert icon={snackbar.severity === 'success' ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FidanlarPage;