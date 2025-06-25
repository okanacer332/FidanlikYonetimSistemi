'use client';

import * as React from 'react';
import { Button, Popover, Stack, Box } from '@mui/material';
import { Calendar as CalendarIcon } from '@phosphor-icons/react';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import { tr } from 'date-fns/locale'; // Türkçe dil desteği için doğru import
import 'react-date-range/dist/styles.css'; // Gerekli ana CSS
import 'react-date-range/dist/theme/default.css'; // Varsayılan tema
import dayjs from 'dayjs';

// Türkçe gün ve ay isimleri için dayjs konfigürasyonu
import 'dayjs/locale/tr';
dayjs.locale('tr');

interface DateRangeFilterProps {
  onChange: (range: { startDate: Date; endDate: Date }) => void;
}

export function DateRangeFilter({ onChange }: DateRangeFilterProps): React.JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  
  // Varsayılan aralığı "bu ay" olarak ayarlıyoruz.
  const [range, setRange] = React.useState<Range>({
    startDate: dayjs().startOf('month').toDate(),
    endDate: dayjs().endOf('month').toDate(),
    key: 'selection',
  });

  // Bileşen ilk yüklendiğinde varsayılan tarih aralığını rapora göndermek için
  React.useEffect(() => {
    if (range.startDate && range.endDate) {
      onChange({ startDate: range.startDate, endDate: range.endDate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Bu useEffect'in sadece bir kez çalışmasını istiyoruz.

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (rangesByKey: RangeKeyDict) => {
    setRange(rangesByKey.selection);
  };

  const applyFilter = () => {
    if (range.startDate && range.endDate) {
      onChange({ startDate: range.startDate, endDate: range.endDate });
      handleClose();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  const formattedStartDate = dayjs(range.startDate).format('DD MMMM YYYY');
  const formattedEndDate = dayjs(range.endDate).format('DD MMMM YYYY');

  return (
    <div>
      <Button
        aria-describedby={id}
        variant="outlined"
        startIcon={<CalendarIcon />}
        onClick={handleClick}
        sx={{ minWidth: 280, justifyContent: 'flex-start' }}
      >
        <Box sx={{ textAlign: 'left' }}>
           {formattedStartDate} - {formattedEndDate}
        </Box>
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Stack spacing={2} sx={{ p: 2, minWidth: 300 }}>
          <DateRange
            editableDateInputs={true}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            ranges={[range]}
            locale={tr} // Hatanın çözümü: Metin yerine 'tr' objesini kullanıyoruz
          />
          <Button variant="contained" onClick={applyFilter}>
            Uygula
          </Button>
        </Stack>
      </Popover>
    </div>
  );
}