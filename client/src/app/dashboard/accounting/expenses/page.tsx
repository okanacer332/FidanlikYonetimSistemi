'use client';

import * as React from 'react';
import { Button, Stack, Typography, CircularProgress, Alert, Tabs, Tab, Box } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react';

import { useUser } from '@/hooks/use-user';
import type { Expense, ExpenseCategory } from '@/types/nursery';
import { ExpensesTable } from '@/components/dashboard/expense/expenses-table'
import { ExpenseCreateForm } from '@/components/dashboard/expense/expense-create-form';
import { ExpenseCategoryList } from '@/components/dashboard/expense/expense-category-list';

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [categories, setCategories] = React.useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = React.useState(false);

  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const canView = currentUser?.roles?.some(role => role.name === 'ADMIN' || role.name === 'ACCOUNTANT');

  const fetchData = React.useCallback(async () => {
    if (!canView) {
      setError('Bu sayfayı görüntüleme yetkiniz yok.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Oturum bulunamadı.');

      const [expensesRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses/categories`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      if (!expensesRes.ok || !categoriesRes.ok) throw new Error('Veriler yüklenemedi.');

      setExpenses(await expensesRes.json());
      setCategories(await categoriesRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [canView]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuccess = () => {
    setCreateModalOpen(false);
    fetchData();
  };

  return (
    <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Gider Yönetimi</Typography>
            <Button
                startIcon={<PlusIcon />}
                variant="contained"
                onClick={() => setCreateModalOpen(true)}
                disabled={!canView}
            >
                Yeni Gider Ekle
            </Button>
        </Stack>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="gider yönetimi sekmesi">
                <Tab label="Giderler" {...a11yProps(0)} />
                <Tab label="Gider Kategorileri" {...a11yProps(1)} />
            </Tabs>
        </Box>
        
        {loading ? (
            <Stack sx={{ alignItems: 'center', mt: 4 }}><CircularProgress /></Stack>
        ) : error ? (
            <Alert severity="error">{error}</Alert>
        ) : (
            <>
                <CustomTabPanel value={tabValue} index={0}>
                    <ExpensesTable expenses={expenses} />
                </CustomTabPanel>
                <CustomTabPanel value={tabValue} index={1}>
                    <ExpenseCategoryList categories={categories} onUpdate={fetchData} />
                </CustomTabPanel>
            </>
        )}
        
        <ExpenseCreateForm
            open={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSuccess={handleSuccess}
            categories={categories}
        />
    </Stack>
  );
}
