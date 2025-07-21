'use client';

import { useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  SvgIcon,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useInflation, type InflationData } from '@/hooks/use-inflation';
import { toast } from 'react-hot-toast';

const Page = () => {
  const { data, isLoading, getInflationData, setIsLoading } = useInflation();

  // DÜZELTME: Yorum satırını kaldırarak bu bloğu tekrar aktif hale getiriyoruz.
  // Artık use-inflation.ts dosyasını düzelttiğimiz için bu kod sorun çıkarmayacak.
  useEffect(() => {
    getInflationData();
  }, [getInflationData]);

  const handleFetchClick = async () => {
    setIsLoading(true);
    toast.loading("TCMB'den veriler çekiliyor...");
    
    try {
      const accessToken = window.localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.dismiss();
        toast.error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/v1/inflation/fetch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Backend isteği başarısız oldu.');
      }

      toast.dismiss();
      toast.success('Veriler başarıyla çekildi ve kaydedildi. Liste güncelleniyor...');
      await getInflationData();

    } catch (error) {
      toast.dismiss();
      console.error('Veri çekme işlemi sırasında bir hata oluştu:', error);
      toast.error('Veri çekme işlemi sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Geri kalan kodun hepsi aynı
  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Enflasyon Verileri</Typography>
            </Stack>
            <div>
              <Button
                startIcon={<SvgIcon fontSize="small"><DownloadIcon /></SvgIcon>}
                variant="contained"
                onClick={handleFetchClick}
                disabled={isLoading}
              >
                {isLoading ? 'Yükleniyor...' : "TCMB'den Veri Çek"}
              </Button>
            </div>
          </Stack>
          <Card>
            {isLoading && data.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Dönem (Yıl-Ay)</TableCell>
                    <TableCell>TÜFE Değeri</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item: InflationData) => (
                    <TableRow hover key={item.id}>
                      <TableCell>{item.period}</TableCell>
                      <TableCell>{item.cpiValue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default Page;