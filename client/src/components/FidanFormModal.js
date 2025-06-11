import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const FidanFormModal = ({ open, onClose, onSave, loading, initialData }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    // Modal açıldığında, eğer düzenleme yapılıyorsa, mevcut ismi forma yazdır
    if (initialData) {
      setName(initialData.name);
    } else {
      setName('');
    }
  }, [initialData, open]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initialData ? 'Kategoriyi Düzenle' : 'Yeni Eleman Ekle'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="İsim"
          type="text"
          fullWidth
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FidanFormModal;