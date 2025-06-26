'use client';

import * as React from 'react';
import { Card, CardContent, Container, Grid, Stack, Typography, Box } from '@mui/material';
import {
  Tree as TreeIcon,
  Users as UsersIcon,
  Package as PackageIcon,
  ChartBar as ChartBarIcon,
  Bank as BankIcon,
  Wrench as WrenchIcon,
} from '@phosphor-icons/react';

// Her bir adım için veri yapısı
interface StepInfo {
  icon: React.ElementType;
  title: string;
  description: string;
}

// Rehber adımlarının içeriği
const steps: StepInfo[] = [
  {
    icon: WrenchIcon,
    title: 'Fidanlık Kurulumu',
    description: 'Ayarlar menüsünden şirket bilgilerinizi, fidan türlerinizi ve çeşitlerinizi tanımlayarak başlayın.',
  },
  {
    icon: TreeIcon,
    title: 'Stokları Ekleyin',
    description: 'Mal Kabul modülüyle elinizdeki fidanları alış fiyatlarıyla sisteme kaydedin, envanterinizi oluşturun.',
  },
  {
    icon: UsersIcon,
    title: 'Müşterileri Tanımlayın',
    description: 'Müşteriler menüsünden cari hesaplarınızı oluşturarak satış sürecini hızlandırın.',
  },
  {
    icon: PackageIcon,
    title: 'İlk Siparişi Oluşturun',
    description: 'Siparişler bölümünden yeni bir satış oluşturun, müşterinizi ve fidanlarınızı seçerek işlemi tamamlayın.',
  },
  {
    icon: BankIcon,
    title: 'Finans Yönetimi',
    description: 'Muhasebe modülüyle ödemelerinizi, tahsilatlarınızı ve giderlerinizi kolayca takip edin.',
  },
  {
    icon: ChartBarIcon,
    title: 'Raporları İnceleyin',
    description: 'Karlılık ve satış raporları ile işletmeniz hakkında kritik bilgiler edinerek büyümenizi izleyin.',
  },
];

// Her bir adım kartını oluşturacak bileşen
function StepCard({ icon: Icon, stepNumber, title, description }: { icon: React.ElementType, stepNumber: number, title: string, description: string }): React.JSX.Element {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        p: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <Icon size={32} />
          </Box>
          <Typography variant="h6" component="h3">
            <Typography component="span" variant="h6" color="text.secondary" sx={{ mr: 1 }}>
              {stepNumber}.
            </Typography>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}


export default function Page(): React.JSX.Element {
  return (
    <Container maxWidth="lg">
      <Stack spacing={1} sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h4" component="h1">
          Fidanlık Yönetim Sistemine Hoş Geldiniz!
        </Typography>
      </Stack>

      {/* Grid kullanımı düzeltildi */}
      <Grid container spacing={4}>
        {steps.map((step, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={step.title}>
            <StepCard
              stepNumber={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}