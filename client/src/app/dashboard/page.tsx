'use client';

import * as React from 'react';
import { Stack, Typography, CircularProgress, Alert, Grid, Card, CardContent, Box, Container } from '@mui/material';
import { Wrench as WrenchIcon, Tree as TreeIcon, Users as UsersIcon, Package as PackageIcon, Bank as BankIcon, ChartBar as ChartIcon } from '@phosphor-icons/react';

// Yeni hook'larımızı ve BİLEŞENLERİMİZİ import ediyoruz
import { useUser } from '@/hooks/use-user';
import { useDashboardSummary } from '@/hooks/use-dashboard-summary';
import { WarehouseDashboard } from '@/components/dashboard/overview/WarehouseDashboard';
import { AdminDashboard } from '@/components/dashboard/overview/AdminDashboard';
import { AccountantDashboard } from '@/components/dashboard/overview/AccountantDashboard'; // <-- YENİ İMPORT

// --- Statik "Hoş Geldiniz" Ekranı (Değişiklik yok) ---
const WelcomeScreen = () => {
    // ...bu fonksiyonun içeriği aynı kalacak...
    const steps = [
        { icon: WrenchIcon, title: 'Fidanlık Kurulumu', description: 'Ayarlar menüsünden şirket bilgilerinizi, fidan türlerinizi ve çeşitlerinizi tanımlayarak başlayın.' },
        { icon: TreeIcon, title: 'Stokları Ekleyin', description: 'Mal Kabul modülüyle elinizdeki fidanları sisteme kaydedin, envanterinizi oluşturun.' },
        { icon: UsersIcon, title: 'Müşterileri Tanımlayın', description: 'Müşteriler menüsünden cari hesaplarınızı oluşturarak satış sürecini hızlandırın.' },
        { icon: PackageIcon, title: 'İlk Siparişi Oluşturun', description: 'Siparişler bölümünden yeni bir satış oluşturun, müşterinizi ve fidanlarınızı seçerek işlemi tamamlayın.' },
        { icon: BankIcon, title: 'Finans Yönetimi', description: 'Muhasebe modülüyle ödemelerinizi, tahsilatlarınızı ve giderlerinizi kolayca takip edin.' },
        { icon: ChartIcon, title: 'Raporları İnceleyin', description: 'Karlılık ve satış raporları ile işletmeniz hakkında kritik bilgiler edinerek büyümenizi izleyin.' },
    ];

    return (
        <Container maxWidth="lg">
        <Stack spacing={1} sx={{ mb: 5, textAlign: 'center' }}>
            <Typography variant="h4" component="h1">Fidanlık Yönetim Sistemine Hoş Geldiniz!</Typography>
        </Stack>
        <Grid container spacing={4}>
            {steps.map((step, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={step.title}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                    <CardContent>
                    <Stack spacing={2} alignItems="center">
                        <Box sx={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <step.icon size={32} />
                        </Box>
                        <Typography variant="h6">{`${index + 1}. ${step.title}`}</Typography>
                        <Typography variant="body2" color="text.secondary">{step.description}</Typography>
                    </Stack>
                    </CardContent>
                </Card>
            </Grid>
            ))}
        </Grid>
        </Container>
    );
};
// --- "Hoş Geldiniz" Ekranı Bitişi ---


export default function Page(): React.JSX.Element {
  const { user } = useUser();
  const { summary, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}><CircularProgress /></Stack>;
  }

  if (error) {
    return <Alert severity="error">Dashboard verileri yüklenirken bir hata oluştu: {error.message}</Alert>;
  }

  if (summary) {
    const primaryRole = user?.roles?.[0]?.name;

    switch (primaryRole) {
      case 'WAREHOUSE_STAFF':
        return <WarehouseDashboard data={summary} />;
      case 'ADMIN':
        return <AdminDashboard data={summary} />;
      // --- YENİ EKLENEN BÖLÜM ---
      case 'ACCOUNTANT':
        return <AccountantDashboard data={summary} />;
      // --- YENİ EKLENEN BÖLÜM SONU ---
      default:
        return <WelcomeScreen />;
    }
  }

  return <WelcomeScreen />;
}