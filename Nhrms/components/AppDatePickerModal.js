// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   Pressable,
// } from 'react-native';

// const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// const MONTH_NAMES = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

// function parseDateValue(value) {
//   if (!value || value === '—') return new Date();
//   const parsed = new Date(value);
//   if (!Number.isNaN(parsed.getTime())) return parsed;

//   const parts = String(value).match(/^(\d{1,2})[-/ ](\d{1,2})[-/ ](\d{4})$/);
//   if (parts) {
//     const day = Number(parts[1]);
//     const month = Number(parts[2]) - 1;
//     const year = Number(parts[3]);
//     return new Date(year, month, day);
//   }

//   return new Date();
// }

// function formatDate(date) {
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = MONTH_NAMES[date.getMonth()];
//   const year = date.getFullYear();
//   return `${day} ${month} ${year}`;
// }

// function buildCalendarDays(visibleMonth) {
//   const year = visibleMonth.getFullYear();
//   const month = visibleMonth.getMonth();
//   const firstDay = new Date(year, month, 1).getDay();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const cells = [];

//   for (let i = 0; i < firstDay; i += 1) {
//     cells.push(null);
//   }

//   for (let day = 1; day <= daysInMonth; day += 1) {
//     cells.push(new Date(year, month, day));
//   }

//   while (cells.length % 7 !== 0) {
//     cells.push(null);
//   }

//   return cells;
// }

// export default function AppDatePickerModal({ visible, value, onClose, onChange }) {
//   const [selectedDate, setSelectedDate] = useState(parseDateValue(value));
//   const [visibleMonth, setVisibleMonth] = useState(
//     new Date(parseDateValue(value).getFullYear(), parseDateValue(value).getMonth(), 1)
//   );

//   useEffect(() => {
//     const parsed = parseDateValue(value);
//     setSelectedDate(parsed);
//     setVisibleMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
//   }, [value, visible]);

//   const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
//       <View style={s.overlay}>
//         <View style={s.sheet}>
//           <View style={s.header}>
//             <Pressable
//               style={s.monthButton}
//               onPress={() =>
//                 setVisibleMonth(
//                   prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
//                 )
//               }
//             >
//               <Text style={s.monthButtonText}>{'<'}</Text>
//             </Pressable>

//             <Text style={s.title}>
//               {MONTH_NAMES[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
//             </Text>

//             <Pressable
//               style={s.monthButton}
//               onPress={() =>
//                 setVisibleMonth(
//                   prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
//                 )
//               }
//             >
//               <Text style={s.monthButtonText}>{'>'}</Text>
//             </Pressable>
//           </View>

//           <Text style={s.selectedLabel}>Selected: {formatDate(selectedDate)}</Text>

//           <View style={s.weekRow}>
//             {WEEK_DAYS.map(day => (
//               <Text key={day} style={s.weekDay}>{day}</Text>
//             ))}
//           </View>

//           <ScrollView showsVerticalScrollIndicator={false}>
//             <View style={s.grid}>
//               {days.map((day, index) => {
//                 if (!day) {
//                   return <View key={`empty-${index}`} style={s.dayCell} />;
//                 }

//                 const isActive =
//                   day.getDate() === selectedDate.getDate() &&
//                   day.getMonth() === selectedDate.getMonth() &&
//                   day.getFullYear() === selectedDate.getFullYear();

//                 return (
//                   <Pressable
//                     key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
//                     style={[s.dayCell, s.dayButton, isActive && s.dayButtonActive]}
//                     onPress={() => setSelectedDate(day)}
//                   >
//                     <Text style={[s.dayText, isActive && s.dayTextActive]}>
//                       {day.getDate()}
//                     </Text>
//                   </Pressable>
//                 );
//               })}
//             </View>
//           </ScrollView>

//           <View style={s.actions}>
//             <Pressable style={s.secondaryBtn} onPress={onClose}>
//               <Text style={s.secondaryText}>Cancel</Text>
//             </Pressable>
//             <Pressable
//               style={s.primaryBtn}
//               onPress={() => {
//                 onChange(formatDate(selectedDate));
//                 onClose();
//               }}
//             >
//               <Text style={s.primaryText}>Select Date</Text>
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const s = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     paddingHorizontal: 18,
//   },
//   sheet: {
//     backgroundColor: '#0f1e30',
//     borderRadius: 24,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#1a3a5c',
//     maxHeight: '82%',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 14,
//   },
//   title: {
//     color: '#F0EDE8',
//     fontSize: 18,
//     fontWeight: '800',
//   },
//   monthButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#17314d',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   monthButtonText: {
//     color: '#F0EDE8',
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   selectedLabel: {
//     color: '#C8C4BE',
//     fontSize: 13,
//     marginBottom: 16,
//   },
//   weekRow: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   weekDay: {
//     flex: 1,
//     color: '#7A94AF',
//     textAlign: 'center',
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   dayCell: {
//     width: '14.285%',
//     aspectRatio: 1,
//     padding: 3,
//   },
//   dayButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 14,
//     backgroundColor: '#13263b',
//     borderWidth: 1,
//     borderColor: '#1a3a5c',
//   },
//   dayButtonActive: {
//     backgroundColor: '#2F6E8E',
//     borderColor: '#2F6E8E',
//   },
//   dayText: {
//     color: '#F0EDE8',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   dayTextActive: {
//     color: '#ffffff',
//     fontWeight: '800',
//   },
//   actions: {
//     flexDirection: 'row',
//     gap: 12,
//     marginTop: 18,
//   },
//   secondaryBtn: {
//     flex: 1,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#1a3a5c',
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   secondaryText: {
//     color: '#C8C4BE',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   primaryBtn: {
//     flex: 1.4,
//     borderRadius: 14,
//     backgroundColor: '#2F6E8E',
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   primaryText: {
//     color: '#ffffff',
//     fontSize: 14,
//     fontWeight: '700',
//   },
// });







/**
 * components/AppDatePickerModal.js
 *
 * FIX: Added year navigation so users can select past years (back to 1950).
 *  • Year selector row appears between month nav arrows and calendar grid.
 *  • Users can tap "‹ Year ›" to jump backward/forward by year.
 *  • minimumYear: 1950, maximumYear: current year.
 *  • All original calendar logic and styles PRESERVED.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, ScrollView, StyleSheet, Text, View, Pressable, TouchableOpacity,
} from 'react-native';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MIN_YEAR = 1950;
const MAX_YEAR = new Date().getFullYear();

function parseDateValue(value) {
  if (!value || value === '—') return new Date();
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const parts = String(value).match(/^(\d{1,2})[-/ ](\d{1,2})[-/ ](\d{4})$/);
  if (parts) return new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]));
  return new Date();
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function buildCalendarDays(visibleMonth) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function AppDatePickerModal({ visible, value, onClose, onChange }) {
  const initial = parseDateValue(value);

  const [selectedDate, setSelectedDate] = useState(initial);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  useEffect(() => {
    const parsed = parseDateValue(value);
    setSelectedDate(parsed);
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
  }, [value, visible]);

  const days = useMemo(
    () => buildCalendarDays(new Date(viewYear, viewMonth, 1)),
    [viewYear, viewMonth]
  );

  // ── Month navigation ───────────────────────────────────────
  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear <= MIN_YEAR) return;
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    const now = new Date();
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return; // don't go to future
    if (viewMonth === 11) {
      if (viewYear >= MAX_YEAR) return;
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // ── Year navigation ───────────────────────────────────────
  const goToPrevYear = () => {
    if (viewYear <= MIN_YEAR) return;
    setViewYear((y) => y - 1);
  };

  const goToNextYear = () => {
    if (viewYear >= MAX_YEAR) return;
    setViewYear((y) => y + 1);
  };

  // Is a day in the future? (disallow future selection)
  const isFuture = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date > today;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>

          {/* ── Month navigation ── */}
          <View style={s.header}>
            <Pressable style={s.monthButton} onPress={goToPrevMonth}>
              <Text style={s.monthButtonText}>{'<'}</Text>
            </Pressable>

            <Text style={s.title}>
              {MONTH_NAMES[viewMonth]}
            </Text>

            <Pressable style={s.monthButton} onPress={goToNextMonth}>
              <Text style={s.monthButtonText}>{'>'}</Text>
            </Pressable>
          </View>

          {/* ── Year navigation ── */}
          <View style={s.yearRow}>
            <Pressable
              style={[s.yearArrow, viewYear <= MIN_YEAR && s.yearArrowDisabled]}
              onPress={goToPrevYear}
              disabled={viewYear <= MIN_YEAR}
            >
              <Text style={s.yearArrowText}>‹</Text>
            </Pressable>

            <Text style={s.yearLabel}>{viewYear}</Text>

            <Pressable
              style={[s.yearArrow, viewYear >= MAX_YEAR && s.yearArrowDisabled]}
              onPress={goToNextYear}
              disabled={viewYear >= MAX_YEAR}
            >
              <Text style={s.yearArrowText}>›</Text>
            </Pressable>
          </View>

          <Text style={s.selectedLabel}>Selected: {formatDate(selectedDate)}</Text>

          {/* ── Week headers ── */}
          <View style={s.weekRow}>
            {WEEK_DAYS.map((day) => (
              <Text key={day} style={s.weekDay}>{day}</Text>
            ))}
          </View>

          {/* ── Calendar grid ── */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={s.grid}>
              {days.map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={s.dayCell} />;

                const future = isFuture(day);
                const isActive =
                  day.getDate() === selectedDate.getDate() &&
                  day.getMonth() === selectedDate.getMonth() &&
                  day.getFullYear() === selectedDate.getFullYear();

                return (
                  <Pressable
                    key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                    style={[
                      s.dayCell,
                      !future && s.dayButton,
                      isActive && s.dayButtonActive,
                      future && s.dayButtonFuture,
                    ]}
                    onPress={() => { if (!future) setSelectedDate(day); }}
                    disabled={future}
                  >
                    <Text style={[
                      s.dayText,
                      isActive && s.dayTextActive,
                      future && s.dayTextFuture,
                    ]}>
                      {day.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* ── Actions ── */}
          <View style={s.actions}>
            <Pressable style={s.secondaryBtn} onPress={onClose}>
              <Text style={s.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={s.primaryBtn}
              onPress={() => { onChange(formatDate(selectedDate)); onClose(); }}
            >
              <Text style={s.primaryText}>Select Date</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', paddingHorizontal: 18,
  },
  sheet: {
    backgroundColor: '#0f1e30', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#1a3a5c', maxHeight: '85%',
  },

  // ── Month row ──
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  title: { color: '#F0EDE8', fontSize: 16, fontWeight: '800' },
  monthButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#17314d', alignItems: 'center', justifyContent: 'center' },
  monthButtonText: { color: '#F0EDE8', fontSize: 18, fontWeight: '700' },

  // ── Year row ──
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 16 },
  yearArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#17314d', alignItems: 'center', justifyContent: 'center' },
  yearArrowDisabled: { backgroundColor: '#0f1e30', opacity: 0.4 },
  yearArrowText: { color: '#F0EDE8', fontSize: 20, fontWeight: '700' },
  yearLabel: { color: '#2F6E8E', fontSize: 20, fontWeight: '900', minWidth: 60, textAlign: 'center' },

  selectedLabel: { color: '#C8C4BE', fontSize: 13, marginBottom: 14 },

  weekRow: { flexDirection: 'row', marginBottom: 10 },
  weekDay: { flex: 1, color: '#7A94AF', textAlign: 'center', fontSize: 12, fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.285%', aspectRatio: 1, padding: 3 },
  dayButton: { alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#13263b', borderWidth: 1, borderColor: '#1a3a5c' },
  dayButtonActive: { backgroundColor: '#2F6E8E', borderColor: '#2F6E8E' },
  dayButtonFuture: { opacity: 0.3 },
  dayText: { color: '#F0EDE8', fontSize: 14, fontWeight: '600' },
  dayTextActive: { color: '#ffffff', fontWeight: '800' },
  dayTextFuture: { color: '#555' },

  actions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  secondaryBtn: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: '#1a3a5c', paddingVertical: 14, alignItems: 'center' },
  secondaryText: { color: '#C8C4BE', fontSize: 14, fontWeight: '600' },
  primaryBtn: { flex: 1.4, borderRadius: 14, backgroundColor: '#2F6E8E', paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
