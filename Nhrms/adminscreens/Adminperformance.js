// import React, { useState } from 'react';
// import {
//   View, Text, ScrollView, TouchableOpacity, SafeAreaView,
//   StatusBar, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform,
// } from 'react-native';

// const C = {
//   bg:           '#112235',
//   surface:      "#0f1e30",
//   surfaceAlt:   "#0f2035",
//   orange:       '#3B82F6',
//   text:         "#F0EDE8",
//   textPrimary:  "#F0EDE8",
//   textSecondary:"#C8C4BE",
//   textMuted:    "#7A7570",
//   border:       '#1a3a5c',
//   accent:       "#4D6FFF",
//   accentSoft:   "#4D6FFF22",
//   info:         "#4D9EFF",
//   warning:      "#FFB830",
//   danger:       "#FF4D6D",
//   dangerSoft:   "#FF4D6D22",
//   success:      "#2DD4A0",
//   successSoft:  "#2DD4A022",
//   teal:         "#2DD4BF",
// };

// const RADIUS = { sm: 8, md: 12, lg: 16, full: 999 };

// const ACCENT_COLORS = ["#4D6FFF","#2F6E8E","#9B59B6","#27AE60","#E74C3C","#F39C12","#2DD4BF","#FF6B9D"];
// const TARGET_TYPES  = ['sales','quality','product','hr','ops'];
// const typeColorMap  = { sales: C.teal, quality: C.warning, product: C.accent, hr: C.success, ops: C.info };

// function initials(name) {
//   return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
// }

// function Avatar({ name, color, size = 38 }) {
//   return (
//     <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color || C.accent, alignItems: 'center', justifyContent: 'center' }}>
//       <Text style={{ color: '#FFF', fontWeight: '700', fontSize: size * 0.36 }}>{initials(name)}</Text>
//     </View>
//   );
// }

// function ProgressBar({ progress, color, height = 5 }) {
//   return (
//     <View style={{ height, backgroundColor: C.border, borderRadius: RADIUS.full, overflow: 'hidden' }}>
//       <View style={{ width: `${Math.min(Math.round(progress * 100), 100)}%`, height: '100%', backgroundColor: color, borderRadius: RADIUS.full }} />
//     </View>
//   );
// }

// function StatusBadge({ label, type }) {
//   const colors = { success: C.success, warning: C.warning, danger: C.danger, info: C.info };
//   const col = colors[type] || C.accent;
//   return (
//     <View style={{ backgroundColor: col + '22', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: col + '44' }}>
//       <Text style={{ color: col, fontSize: 11, fontWeight: '700' }}>{label}</Text>
//     </View>
//   );
// }

// const ratingColor = (r) => r >= 4.5 ? C.success : r >= 3.5 ? C.warning : C.danger;

// const EMPTY_EMP_FORM = { name: '', role: '', rating: '', attendance: '', kpis: '' };
// const EMPTY_TGT_FORM = { title: '', assignee: '', deadline: '', progress: '', type: 'sales' };

// export default function PerformanceScreen({ onMenu, onTabPress, activeTab , onBack}) {
//   const [tab, setTab] = useState('overview');
//   const [employees, setEmployees] = useState([]);
//   const [targets, setTargets] = useState([]);

//   const [showEmpModal, setShowEmpModal] = useState(false);
//   const [empForm, setEmpForm] = useState(EMPTY_EMP_FORM);
//   const [editEmpId, setEditEmpId] = useState(null);

//   const [showTgtModal, setShowTgtModal] = useState(false);
//   const [tgtForm, setTgtForm] = useState(EMPTY_TGT_FORM);
//   const [editTgtId, setEditTgtId] = useState(null);

//   // ── Employee handlers ────────────────────────────────────
//   const openAddEmp = () => { setEditEmpId(null); setEmpForm(EMPTY_EMP_FORM); setShowEmpModal(true); };
//   const openEditEmp = (emp) => {
//     setEditEmpId(emp.id);
//     setEmpForm({ name: emp.name, role: emp.role, rating: String(emp.rating), attendance: String(emp.attendance), kpis: emp.kpis.map(k => `${k.label}:${k.val}`).join(',') });
//     setShowEmpModal(true);
//   };

//   const handleSaveEmp = () => {
//     if (!empForm.name.trim()) return;
//     const rating = Math.min(5, Math.max(0, parseFloat(empForm.rating) || 0));
//     const attendance = Math.min(100, Math.max(0, parseInt(empForm.attendance) || 0));
//     const kpis = empForm.kpis.split(',').map(k => {
//       const [label, val] = k.split(':');
//       return { label: label?.trim() || 'KPI', val: Math.min(1, Math.max(0, parseFloat(val) || 0)) };
//     }).filter(k => k.label);

//     const idx = employees.length;
//     if (editEmpId) {
//       setEmployees(prev => prev.map(e => e.id === editEmpId ? { ...e, name: empForm.name.trim(), role: empForm.role.trim(), rating, attendance, kpis } : e));
//     } else {
//       setEmployees(prev => [...prev, {
//         id: `E${String(prev.length + 1).padStart(3, '0')}`,
//         name: empForm.name.trim(),
//         role: empForm.role.trim() || 'Employee',
//         rating,
//         attendance,
//         tasksCompleted: 0,
//         tasksTotal: 0,
//         kpis: kpis.length > 0 ? kpis : [{ label: 'Performance', val: rating / 5 }],
//         color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
//       }]);
//     }
//     setShowEmpModal(false);
//     setEmpForm(EMPTY_EMP_FORM);
//   };

//   const handleDeleteEmp = (id) => setEmployees(prev => prev.filter(e => e.id !== id));

//   // ── Target handlers ──────────────────────────────────────
//   const openAddTgt = () => { setEditTgtId(null); setTgtForm(EMPTY_TGT_FORM); setShowTgtModal(true); };
//   const openEditTgt = (t) => {
//     setEditTgtId(t.id);
//     setTgtForm({ title: t.title, assignee: t.assignee, deadline: t.deadline, progress: String(Math.round(t.progress * 100)), type: t.type });
//     setShowTgtModal(true);
//   };

//   const handleSaveTgt = () => {
//     if (!tgtForm.title.trim()) return;
//     const progress = Math.min(100, Math.max(0, parseInt(tgtForm.progress) || 0)) / 100;
//     if (editTgtId) {
//       setTargets(prev => prev.map(t => t.id === editTgtId ? { ...t, title: tgtForm.title.trim(), assignee: tgtForm.assignee.trim(), deadline: tgtForm.deadline.trim(), progress, type: tgtForm.type } : t));
//     } else {
//       setTargets(prev => [...prev, {
//         id: `TG${String(prev.length + 1).padStart(3, '0')}`,
//         title: tgtForm.title.trim(),
//         assignee: tgtForm.assignee.trim() || 'Team',
//         deadline: tgtForm.deadline.trim() || '—',
//         progress,
//         type: tgtForm.type,
//       }]);
//     }
//     setShowTgtModal(false);
//     setTgtForm(EMPTY_TGT_FORM);
//   };

//   const handleDeleteTgt = (id) => setTargets(prev => prev.filter(t => t.id !== id));

//   const sorted = [...employees].sort((a, b) => b.rating - a.rating);

//   return (
//     <SafeAreaView style={s.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={C.bg} />

//       {/* Header */}
     
//         <View style={s.header}>
//   <TouchableOpacity
//     style={s.backBtn}
//     onPress={onBack}
//     activeOpacity={0.7}
//   >
//     <Text style={s.backArrow}>‹</Text>
//     <Text style={s.backLabel}>Admin</Text>
//   </TouchableOpacity>
//         <View>
//           <Text style={s.headerTitle}>Performance</Text>
//           <Text style={s.headerSub}>Goals, KPIs & ratings</Text>
//         </View>
//         <TouchableOpacity style={s.addHeaderBtn} onPress={tab === 'targets' ? openAddTgt : openAddEmp}>
//           <Text style={{ color: '#FFF', fontSize: 22, lineHeight: 24 }}>+</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Tabs */}
//       <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
//         {['overview', 'targets', 'ratings'].map(t => (
//           <TouchableOpacity
//             key={t}
//             onPress={() => setTab(t)}
//             style={{ flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: tab === t ? "#2F6E8E" : 'transparent' }}
//           >
//             <Text style={{ color: tab === t ? "#2F6E8E" : C.textMuted, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' }}>{t}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>

//         {/* ── OVERVIEW tab ── */}
//         {tab === 'overview' && (
//           <>
//             {/* Top 3 */}
//             {sorted.length > 0 && (
//               <View style={s.card}>
//                 <Text style={s.sectionTitle}>🏆 Top Performers</Text>
//                 <Text style={s.sectionSub}>This month</Text>
//                 {sorted.slice(0, 3).map((emp, idx) => (
//                   <View key={emp.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: idx < Math.min(2, sorted.length - 1) ? 1 : 0, borderBottomColor: C.border }}>
//                     <Text style={{ fontSize: 18, width: 30, textAlign: 'center' }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</Text>
//                     <Avatar name={emp.name} color={emp.color} size={38} />
//                     <View style={{ flex: 1, marginLeft: 10 }}>
//                       <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 13 }}>{emp.name}</Text>
//                       <Text style={{ color: C.textMuted, fontSize: 11 }}>{emp.role}</Text>
//                     </View>
//                     <View style={{ alignItems: 'flex-end' }}>
//                       <Text style={{ color: ratingColor(emp.rating), fontWeight: '800', fontSize: 16 }}>★ {emp.rating.toFixed(1)}</Text>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             )}

//             <TouchableOpacity style={s.addBtn} onPress={openAddEmp} activeOpacity={0.85}>
//               <Text style={s.addBtnText}>+ Add Employee</Text>
//             </TouchableOpacity>

//             {employees.length === 0 && (
//               <View style={s.emptyState}>
//                 <Text style={s.emptyEmoji}>📊</Text>
//                 <Text style={s.emptyText}>No employees yet</Text>
//                 <Text style={s.emptySub}>Tap "+ Add Employee" to track performance</Text>
//               </View>
//             )}

//             {employees.map(emp => (
//               <View key={emp.id} style={s.card}>
//                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
//                   <Avatar name={emp.name} color={emp.color} size={44} />
//                   <View style={{ flex: 1, marginLeft: 12 }}>
//                     <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 14 }}>{emp.name}</Text>
//                     <Text style={{ color: C.textMuted, fontSize: 12 }}>{emp.role}</Text>
//                   </View>
//                   <View style={{ alignItems: 'flex-end' }}>
//                     <Text style={{ color: ratingColor(emp.rating), fontWeight: '800', fontSize: 18 }}>★ {emp.rating.toFixed(1)}</Text>
//                     <Text style={{ color: C.textMuted, fontSize: 10 }}>Attendance: {emp.attendance}%</Text>
//                   </View>
//                 </View>
//                 {emp.kpis.map(kpi => (
//                   <View key={kpi.label} style={{ marginBottom: 8 }}>
//                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
//                       <Text style={{ color: C.textSecondary, fontSize: 12 }}>{kpi.label}</Text>
//                       <Text style={{ color: kpi.val >= 0.85 ? C.success : kpi.val >= 0.7 ? C.warning : C.danger, fontWeight: '700', fontSize: 12 }}>{Math.round(kpi.val * 100)}%</Text>
//                     </View>
//                     <ProgressBar progress={kpi.val} color={kpi.val >= 0.85 ? C.success : kpi.val >= 0.7 ? C.warning : C.danger} />
//                   </View>
//                 ))}
//                 <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
//                   <TouchableOpacity style={{ flex: 1, backgroundColor: C.accentSoft, borderRadius: RADIUS.sm, paddingVertical: 8, alignItems: 'center' }} onPress={() => openEditEmp(emp)}>
//                     <Text style={{ color: C.accent, fontSize: 12, fontWeight: '700' }}>EDIT</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={{ flex: 1, backgroundColor: C.dangerSoft, borderRadius: RADIUS.sm, paddingVertical: 8, alignItems: 'center' }} onPress={() => handleDeleteEmp(emp.id)}>
//                     <Text style={{ color: C.danger, fontSize: 12, fontWeight: '700' }}>REMOVE</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))}
//           </>
//         )}

//         {/* ── TARGETS tab ── */}
//         {tab === 'targets' && (
//           <>
//             <TouchableOpacity style={s.addBtn} onPress={openAddTgt} activeOpacity={0.85}>
//               <Text style={s.addBtnText}>+ Add Target</Text>
//             </TouchableOpacity>

//             {targets.length === 0 && (
//               <View style={s.emptyState}>
//                 <Text style={s.emptyEmoji}>🎯</Text>
//                 <Text style={s.emptyText}>No targets yet</Text>
//                 <Text style={s.emptySub}>Tap "+ Add Target" to set goals</Text>
//               </View>
//             )}

//             {targets.map(target => (
//               <View key={target.id} style={s.card}>
//                 <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
//                   <View style={{ flex: 1, marginRight: 10 }}>
//                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
//                       <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: typeColorMap[target.type] }} />
//                       <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 14 }}>{target.title}</Text>
//                     </View>
//                     <Text style={{ color: C.textMuted, fontSize: 12 }}>👤 {target.assignee}</Text>
//                     <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>📅 {target.deadline}</Text>
//                   </View>
//                   <Text style={{ color: typeColorMap[target.type], fontWeight: '800', fontSize: 18 }}>{Math.round(target.progress * 100)}%</Text>
//                 </View>
//                 <ProgressBar progress={target.progress} color={typeColorMap[target.type]} height={8} />
//                 <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
//                   <TouchableOpacity style={{ flex: 1, backgroundColor: C.accentSoft, borderRadius: RADIUS.sm, paddingVertical: 8, alignItems: 'center' }} onPress={() => openEditTgt(target)}>
//                     <Text style={{ color: C.accent, fontSize: 12, fontWeight: '700' }}>UPDATE</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={{ flex: 1, backgroundColor: C.dangerSoft, borderRadius: RADIUS.sm, paddingVertical: 8, alignItems: 'center' }} onPress={() => handleDeleteTgt(target.id)}>
//                     <Text style={{ color: C.danger, fontSize: 12, fontWeight: '700' }}>REMOVE</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))}
//           </>
//         )}

//         {/* ── RATINGS tab ── */}
//         {tab === 'ratings' && (
//           <>
//             <TouchableOpacity style={s.addBtn} onPress={openAddEmp} activeOpacity={0.85}>
//               <Text style={s.addBtnText}>+ Add Employee</Text>
//             </TouchableOpacity>

//             {employees.length === 0 && (
//               <View style={s.emptyState}>
//                 <Text style={s.emptyEmoji}>⭐</Text>
//                 <Text style={s.emptyText}>No ratings yet</Text>
//                 <Text style={s.emptySub}>Add employees to see their ratings</Text>
//               </View>
//             )}

//             {sorted.map(emp => (
//               <View key={emp.id} style={[s.card, { flexDirection: 'row', alignItems: 'center' }]}>
//                 <Avatar name={emp.name} color={emp.color} size={44} />
//                 <View style={{ flex: 1, marginLeft: 12 }}>
//                   <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 14 }}>{emp.name}</Text>
//                   <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{emp.role}</Text>
//                   <View style={{ flexDirection: 'row', marginTop: 6, gap: 3 }}>
//                     {[1,2,3,4,5].map(star => (
//                       <Text key={star} style={{ color: star <= Math.round(emp.rating) ? '#FFD700' : C.surfaceAlt, fontSize: 14 }}>★</Text>
//                     ))}
//                   </View>
//                 </View>
//                 <View style={{ alignItems: 'flex-end' }}>
//                   <Text style={{ color: ratingColor(emp.rating), fontWeight: '800', fontSize: 24 }}>{emp.rating.toFixed(1)}</Text>
//                   <Text style={{ color: C.textMuted, fontSize: 10 }}>/ 5.0</Text>
//                   <View style={{ marginTop: 6 }}>
//                     <StatusBadge
//                       label={emp.rating >= 4.5 ? 'Excellent' : emp.rating >= 3.5 ? 'Good' : 'Needs Work'}
//                       type={emp.rating >= 4.5 ? 'success' : emp.rating >= 3.5 ? 'warning' : 'danger'}
//                     />
//                   </View>
//                 </View>
//               </View>
//             ))}
//           </>
//         )}
//       </ScrollView>

//       {/* ── Add/Edit Employee Modal ── */}
//       <Modal visible={showEmpModal} transparent animationType="slide" onRequestClose={() => setShowEmpModal(false)}>
//         <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//           <View style={s.modalSheet}>
//             <View style={s.sheetHandle} />
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
//               <Text style={s.sheetTitle}>{editEmpId ? 'Edit Employee' : 'Add Employee'}</Text>
//               <TouchableOpacity onPress={() => setShowEmpModal(false)}>
//                 <Text style={{ color: C.textMuted, fontSize: 22 }}>✕</Text>
//               </TouchableOpacity>
//             </View>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               {[
//                 ['Full Name *', 'name', 'e.g. Priya Mehta'],
//                 ['Role / Designation', 'role', 'e.g. Backend Developer'],
//                 ['Rating (0–5)', 'rating', 'e.g. 4.5'],
//                 ['Attendance %', 'attendance', 'e.g. 95'],
//                 ['KPIs (Label:Value,...)', 'kpis', 'e.g. Code Quality:0.9,On-Time:0.85'],
//               ].map(([label, key, ph]) => (
//                 <View key={key} style={{ marginBottom: 14 }}>
//                   <Text style={s.fieldLabel}>{label}</Text>
//                   <TextInput
//                     value={empForm[key]}
//                     onChangeText={v => setEmpForm(prev => ({ ...prev, [key]: v }))}
//                     placeholder={ph}
//                     placeholderTextColor={C.textMuted}
//                     style={s.fieldInput}
//                     keyboardType={['rating','attendance'].includes(key) ? 'decimal-pad' : 'default'}
//                   />
//                 </View>
//               ))}
//               <Text style={[s.fieldLabel, { marginBottom: 4, color: C.textMuted + 'AA', fontSize: 11 }]}>KPI format: "Label:0.0 to 1.0" comma-separated</Text>
//               <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
//                 <TouchableOpacity style={s.cancelBtn} onPress={() => setShowEmpModal(false)}>
//                   <Text style={s.cancelBtnText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[s.saveBtn, !empForm.name.trim() && { opacity: 0.4 }]}
//                   onPress={handleSaveEmp}
//                 >
//                   <Text style={s.saveBtnText}>{editEmpId ? 'Save Changes' : 'Add Employee'}</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* ── Add/Edit Target Modal ── */}
//       <Modal visible={showTgtModal} transparent animationType="slide" onRequestClose={() => setShowTgtModal(false)}>
//         <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//           <View style={s.modalSheet}>
//             <View style={s.sheetHandle} />
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
//               <Text style={s.sheetTitle}>{editTgtId ? 'Edit Target' : 'Add Target'}</Text>
//               <TouchableOpacity onPress={() => setShowTgtModal(false)}>
//                 <Text style={{ color: C.textMuted, fontSize: 22 }}>✕</Text>
//               </TouchableOpacity>
//             </View>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               {[
//                 ['Target Title *', 'title', 'e.g. Acquire 50 new customers'],
//                 ['Assigned To', 'assignee', 'e.g. Sales Team'],
//                 ['Deadline', 'deadline', 'e.g. 30 Jun 2025'],
//                 ['Progress % (0–100)', 'progress', 'e.g. 62'],
//               ].map(([label, key, ph]) => (
//                 <View key={key} style={{ marginBottom: 14 }}>
//                   <Text style={s.fieldLabel}>{label}</Text>
//                   <TextInput
//                     value={tgtForm[key]}
//                     onChangeText={v => setTgtForm(prev => ({ ...prev, [key]: v }))}
//                     placeholder={ph}
//                     placeholderTextColor={C.textMuted}
//                     style={s.fieldInput}
//                     keyboardType={key === 'progress' ? 'number-pad' : 'default'}
//                   />
//                 </View>
//               ))}

//               {/* Type selector */}
//               <Text style={s.fieldLabel}>Type</Text>
//               <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
//                 {TARGET_TYPES.map(type => {
//                   const col = typeColorMap[type];
//                   const active = tgtForm.type === type;
//                   return (
//                     <TouchableOpacity
//                       key={type}
//                       onPress={() => setTgtForm(prev => ({ ...prev, type }))}
//                       style={{
//                         paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full,
//                         backgroundColor: active ? col + '30' : C.surfaceAlt,
//                         borderWidth: 1, borderColor: active ? col : C.border,
//                       }}
//                     >
//                       <Text style={{ color: active ? col : C.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{type}</Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>

//               <View style={{ flexDirection: 'row', gap: 12 }}>
//                 <TouchableOpacity style={s.cancelBtn} onPress={() => setShowTgtModal(false)}>
//                   <Text style={s.cancelBtnText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[s.saveBtn, !tgtForm.title.trim() && { opacity: 0.4 }]}
//                   onPress={handleSaveTgt}
//                 >
//                   <Text style={s.saveBtnText}>{editTgtId ? 'Save Changes' : 'Add Target'}</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.bg },

//   header: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     paddingHorizontal: 20, paddingTop: 29, paddingBottom: 12,
//     backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border,
//   },
//   headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
//   headerSub:   { fontSize: 12, color: C.textMuted, marginTop: 2 },
//   addHeaderBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#2F6E8E", alignItems: 'center', justifyContent: 'center' },

//   addBtn: {
//     backgroundColor: "#2F6E8E", borderRadius: 12, paddingVertical: 13,
//     alignItems: 'center', marginBottom: 16,
//     shadowColor: "#2F6E8E", shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
//   },
//   addBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

//   emptyState: { alignItems: 'center', paddingTop: 50, gap: 10 },
//   emptyEmoji: { fontSize: 44 },
//   emptyText:  { fontSize: 17, color: C.text, fontWeight: '700' },
//   emptySub:   { fontSize: 13, color: C.textMuted },

//   card: {
//     backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: 16,
//     marginBottom: 12, borderWidth: 1, borderColor: C.border,
//   },
//   sectionTitle: { color: C.textPrimary, fontWeight: '800', fontSize: 15, marginBottom: 2 },
//   sectionSub:   { color: C.textMuted, fontSize: 12, marginBottom: 12 },

//   // Modal
//   modalSheet: {
//     backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
//     padding: 24, paddingBottom: 36, borderWidth: 1, borderColor: C.border, maxHeight: '90%',
//   },
//   sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#1a3a5c', alignSelf: 'center', marginBottom: 20 },
//   sheetTitle:  { fontSize: 20, fontWeight: '800', color: C.text },
//   fieldLabel:  { fontSize: 12, fontWeight: '600', color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
//   fieldInput:  {
//     backgroundColor: C.surfaceAlt, borderRadius: RADIUS.md, borderWidth: 1,
//     borderColor: C.border, paddingHorizontal: 14, paddingVertical: 13,
//     fontSize: 15, color: C.textPrimary,
//   },
//   cancelBtn: {
//     flex: 1, paddingVertical: 14, borderRadius: RADIUS.md,
//     borderWidth: 1, borderColor: C.border, alignItems: 'center',
//   },
//   cancelBtnText: { color: C.textMuted, fontSize: 15, fontWeight: '600' },
//   saveBtn:       { flex: 2, paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: "#2F6E8E", alignItems: 'center' },
//   saveBtnText:   { color: '#FFF', fontSize: 15, fontWeight: '700' },
//   backBtn: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   paddingHorizontal: 10,
//   paddingVertical: 6,
// },

// backArrow: {
//   color: "#2F6E8E",
//   fontSize: 24,
//   fontWeight: '700',
//   marginRight: 4,
// },

// backLabel: {
//   color: C.text,
//   fontSize: 14,
//   fontWeight: '600',
// },
// });






import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  StatusBar, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { taskApi } from '../api/taskapi';

const C = {
  bg: '#112235',
  surface: "#0f1e30",
  surfaceAlt: "#0f2035",
  orange: '#3B82F6',
  text: "#F0EDE8",
  textPrimary: "#F0EDE8",
  textSecondary: "#C8C4BE",
  textMuted: "#7A7570",
  border: '#1a3a5c',
  accent: "#4D6FFF",
  accentSoft: "#4D6FFF22",
  info: "#4D9EFF",
  warning: "#FFB830",
  danger: "#FF4D6D",
  dangerSoft: "#FF4D6D22",
  success: "#2DD4A0",
  successSoft: "#2DD4A022",
  teal: "#2DD4BF",
};

const RADIUS = { sm: 8, md: 12, lg: 16, full: 999 };

const ACCENT_COLORS = ["#4D6FFF","#2F6E8E","#9B59B6","#27AE60","#E74C3C","#F39C12","#2DD4BF","#FF6B9D"];
const TARGET_TYPES = ['sales','quality','product','hr','ops'];
const typeColorMap = { sales: C.teal, quality: C.warning, product: C.accent, hr: C.success, ops: C.info };

function initials(name) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function Avatar({ name, color, size = 38 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color || C.accent, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: size * 0.36 }}>{initials(name)}</Text>
    </View>
  );
}

function ProgressBar({ progress, color, height = 5 }) {
  return (
    <View style={{ height, backgroundColor: C.border, borderRadius: RADIUS.full, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(Math.round(progress * 100), 100)}%`, height: '100%', backgroundColor: color, borderRadius: RADIUS.full }} />
    </View>
  );
}

function StatusBadge({ label, type = 'info' }) {
  const col =
    type === 'success' ? C.success :
    type === 'warning' ? C.warning :
    type === 'danger' ? C.danger : C.info;

  return (
    <View style={{ backgroundColor: `${col}22`, borderColor: `${col}55`, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: col, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

const ratingColor = (r) => r >= 4.5 ? C.success : r >= 3.5 ? C.warning : C.danger;

const EMPTY_EMP_FORM = { name: '', role: '', rating: '', attendance: '', kpis: '' };
const EMPTY_TGT_FORM = { title: '', assignee: '', deadline: '', progress: '', type: 'sales' };

function formatStatus(status = '') {
  const s = String(status).toLowerCase().trim();
  if (s === 'todo' || s === 'to do') return 'To Do';
  if (s === 'in-progress' || s === 'in progress') return 'In Progress';
  if (s === 'review') return 'Review';
  if (s === 'done' || s === 'completed' || s === 'complete') return 'Done';
  return 'To Do';
}

function getTaskAssignee(task) {
  return (
    task.assigneeName ||
    task.assignedToName ||
    task.assignee ||
    task.employeeName ||
    task.fullName ||
    task.userName ||
    task.employeeId ||
    'Unassigned'
  );
}

function getTaskRole(task) {
  return (
    task.assigneeRole ||
    task.designation ||
    task.role ||
    'Employee'
  );
}

function getTaskDeadline(task) {
  return task.dueText || task.deadline || task.dueDate || '—';
}

function getTaskTitle(task) {
  return task.title || task.taskTitle || 'Untitled Task';
}

function getTaskProgress(task) {
  const status = formatStatus(task.status);
  const raw = Number(task.progress || 0);
  if (status === 'Done') return 100;
  return Math.max(0, Math.min(100, raw));
}

function mapTaskType(task) {
  const raw = String(task.type || task.category || '').toLowerCase();
  if (TARGET_TYPES.includes(raw)) return raw;
  return 'product';
}

async function fetchAllTasksForPerformance() {
  if (typeof taskApi.getAllTasks === 'function') {
    return await taskApi.getAllTasks();
  }
  if (typeof taskApi.getAdminTasks === 'function') {
    return await taskApi.getAdminTasks();
  }
  if (typeof taskApi.getTasks === 'function') {
    return await taskApi.getTasks();
  }
  throw new Error('Please add getAllTasks or getAdminTasks in taskApi');
}

function deriveEmployeesFromTasks(tasks) {
  const grouped = {};

  tasks.forEach((task) => {
    const name = getTaskAssignee(task);
    const role = getTaskRole(task);
    const status = formatStatus(task.status);
    const progress = getTaskProgress(task);

    if (!grouped[name]) {
      grouped[name] = {
        name,
        role,
        total: 0,
        completed: 0,
        active: 0,
      };
    }

    grouped[name].total += 1;

    if (status === 'Done' || progress >= 100) {
      grouped[name].completed += 1;
    } else {
      grouped[name].active += 1;
    }
  });

  return Object.values(grouped).map((emp, idx) => {
    const completionRate = emp.total > 0 ? emp.completed / emp.total : 0;
    const activeRate = emp.total > 0 ? (emp.total - emp.active) / emp.total : 0;

    return {
      id: `E${String(idx + 1).padStart(3, '0')}`,
      name: emp.name,
      role: emp.role,
      rating: 5, // fixed perfect rating now = 10/10 logic without changing UI
      attendance: 100,
      tasksCompleted: emp.completed,
      tasksTotal: emp.total,
      kpis: [
        { label: 'Task Completion', val: completionRate },
        { label: 'Target Achievement', val: completionRate },
        { label: 'Performance', val: activeRate },
      ],
      color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
    };
  });
}

function deriveTargetsFromTasks(tasks) {
  const completedTasks = tasks.filter((task) => {
    const status = formatStatus(task.status);
    const progress = getTaskProgress(task);
    return status === 'Done' || progress >= 100;
  });

  return completedTasks.map((task, idx) => ({
    id: String(task.id || `TG${idx + 1}`),
    title: getTaskTitle(task),
    assignee: getTaskAssignee(task),
    deadline: getTaskDeadline(task),
    progress: 1,
    type: mapTaskType(task),
  }));
}

export default function Adminperformance({ onMenu, onTabPress, activeTab, onBack }) {
  const [tab, setTab] = useState('overview');
  const [employees, setEmployees] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showEmpModal, setShowEmpModal] = useState(false);
  const [empForm, setEmpForm] = useState(EMPTY_EMP_FORM);
  const [editEmpId, setEditEmpId] = useState(null);

  const [showTgtModal, setShowTgtModal] = useState(false);
  const [tgtForm, setTgtForm] = useState(EMPTY_TGT_FORM);
  const [editTgtId, setEditTgtId] = useState(null);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const allTasks = await fetchAllTasksForPerformance();
      const safeTasks = Array.isArray(allTasks) ? allTasks : [];

      setEmployees(deriveEmployeesFromTasks(safeTasks));
      setTargets(deriveTargetsFromTasks(safeTasks));
    } catch (e) {
      console.log('Performance load failed:', e?.message || e);
      setEmployees([]);
      setTargets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();

    const timer = setInterval(() => {
      loadPerformanceData();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const openAddEmp = () => { setEditEmpId(null); setEmpForm(EMPTY_EMP_FORM); setShowEmpModal(true); };
  const openEditEmp = (emp) => {
    setEditEmpId(emp.id);
    setEmpForm({
      name: emp.name,
      role: emp.role,
      rating: String(emp.rating),
      attendance: String(emp.attendance),
      kpis: emp.kpis.map(k => `${k.label}:${k.val}`).join(','),
    });
    setShowEmpModal(true);
  };

  const handleSaveEmp = () => {
    if (!empForm.name.trim()) return;
    const rating = Math.min(5, Math.max(0, parseFloat(empForm.rating) || 0));
    const attendance = Math.min(100, Math.max(0, parseInt(empForm.attendance) || 0));
    const kpis = empForm.kpis.split(',').map(k => {
      const [label, val] = k.split(':');
      return { label: label?.trim() || 'KPI', val: Math.min(1, Math.max(0, parseFloat(val) || 0)) };
    }).filter(k => k.label);

    const idx = employees.length;
    if (editEmpId) {
      setEmployees(prev => prev.map(e => e.id === editEmpId ? {
        ...e,
        name: empForm.name.trim(),
        role: empForm.role.trim(),
        rating,
        attendance,
        kpis,
      } : e));
    } else {
      setEmployees(prev => [...prev, {
        id: `E${String(prev.length + 1).padStart(3, '0')}`,
        name: empForm.name.trim(),
        role: empForm.role.trim() || 'Employee',
        rating,
        attendance,
        tasksCompleted: 0,
        tasksTotal: 0,
        kpis: kpis.length > 0 ? kpis : [{ label: 'Performance', val: rating / 5 }],
        color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
      }]);
    }
    setShowEmpModal(false);
    setEmpForm(EMPTY_EMP_FORM);
  };

  const handleDeleteEmp = (id) => setEmployees(prev => prev.filter(e => e.id !== id));

  const openAddTgt = () => { setEditTgtId(null); setTgtForm(EMPTY_TGT_FORM); setShowTgtModal(true); };
  const openEditTgt = (t) => {
    setEditTgtId(t.id);
    setTgtForm({
      title: t.title,
      assignee: t.assignee,
      deadline: t.deadline,
      progress: String(Math.round(t.progress * 100)),
      type: t.type,
    });
    setShowTgtModal(true);
  };

  const handleSaveTgt = () => {
    if (!tgtForm.title.trim()) return;
    const progress = Math.min(100, Math.max(0, parseInt(tgtForm.progress) || 0)) / 100;
    if (editTgtId) {
      setTargets(prev => prev.map(t => t.id === editTgtId ? {
        ...t,
        title: tgtForm.title.trim(),
        assignee: tgtForm.assignee.trim(),
        deadline: tgtForm.deadline.trim(),
        progress,
        type: tgtForm.type,
      } : t));
    } else {
      setTargets(prev => [...prev, {
        id: `TG${String(prev.length + 1).padStart(3, '0')}`,
        title: tgtForm.title.trim(),
        assignee: tgtForm.assignee.trim() || 'Team',
        deadline: tgtForm.deadline.trim() || '—',
        progress,
        type: tgtForm.type,
      }]);
    }
    setShowTgtModal(false);
    setTgtForm(EMPTY_TGT_FORM);
  };

  const handleDeleteTgt = (id) => setTargets(prev => prev.filter(t => t.id !== id));

  const sorted = useMemo(() => [...employees].sort((a, b) => b.rating - a.rating), [employees]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={s.backArrow}>‹</Text>
          <Text style={s.backLabel}>Admin</Text>
        </TouchableOpacity>

        <View>
          <Text style={s.headerTitle}>Performance</Text>
          <Text style={s.headerSub}>Goals, KPIs & ratings</Text>
        </View>

        <TouchableOpacity style={s.addHeaderBtn} onPress={tab === 'targets' ? openAddTgt : openAddEmp}>
          <Text style={{ color: '#FFF', fontSize: 22, lineHeight: 24 }}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
        {['overview', 'targets', 'ratings'].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{ flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: tab === t ? "#2F6E8E" : 'transparent' }}
          >
            <Text style={{ color: tab === t ? "#2F6E8E" : C.textMuted, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {loading && (
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>⏳</Text>
            <Text style={s.emptyText}>Loading performance data...</Text>
          </View>
        )}

        {tab === 'overview' && !loading && (
          <>
            {sorted.length > 0 && (
              <View style={s.card}>
                <Text style={s.sectionTitle}>🏆 Top Performers</Text>
                <Text style={s.sectionSub}>Based on task updates</Text>
                {sorted.slice(0, 3).map((emp, idx) => (
                  <View key={emp.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: idx < Math.min(2, sorted.length - 1) ? 1 : 0, borderBottomColor: C.border }}>
                    <Text style={{ fontSize: 18, width: 30, textAlign: 'center' }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</Text>
                    <Avatar name={emp.name} color={emp.color} size={38} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 13 }}>{emp.name}</Text>
                      <Text style={{ color: C.textMuted, fontSize: 11 }}>{emp.role}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: ratingColor(emp.rating), fontWeight: '800', fontSize: 16 }}>★ {emp.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={s.addBtn} onPress={openAddEmp} activeOpacity={0.85}>
              <Text style={s.addBtnText}>+ Add Employee</Text>
            </TouchableOpacity>

            {employees.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyEmoji}>📊</Text>
                <Text style={s.emptyText}>No task performance yet</Text>
                <Text style={s.emptySub}>Task screen updates will show here</Text>
              </View>
            )}

            {employees.map(emp => (
              <View key={emp.id} style={s.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <Avatar name={emp.name} color={emp.color} size={44} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 14 }}>{emp.name}</Text>
                    <Text style={{ color: C.textMuted, fontSize: 12 }}>{emp.role}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: ratingColor(emp.rating), fontWeight: '800', fontSize: 18 }}>★ {emp.rating.toFixed(1)}</Text>
                    <Text style={{ color: C.textMuted, fontSize: 10 }}>Attendance: {emp.attendance}%</Text>
                  </View>
                </View>

                {emp.kpis.map(kpi => (
                  <View key={kpi.label} style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: C.textSecondary, fontSize: 12 }}>{kpi.label}</Text>
                      <Text style={{ color: kpi.val >= 0.85 ? C.success : kpi.val >= 0.7 ? C.warning : C.danger, fontWeight: '700', fontSize: 12 }}>
                        {Math.round(kpi.val * 100)}%
                      </Text>
                    </View>
                    <ProgressBar progress={kpi.val} color={kpi.val >= 0.85 ? C.success : kpi.val >= 0.7 ? C.warning : C.danger} />
                  </View>
                ))}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                  <Text style={{ color: C.textMuted, fontSize: 12 }}>
                    Completed: {emp.tasksCompleted}/{emp.tasksTotal}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: C.accentSoft, borderRadius: RADIUS.sm, paddingVertical: 8, alignItems: 'center' }} onPress={() => openEditEmp(emp)}>
                    <Text style={{ color: C.accent, fontSize: 12, fontWeight: '700' }}>EDIT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: C.dangerSoft, borderRadius: RADIUS.sm, paddingVertical: 8, alignItems: 'center' }} onPress={() => handleDeleteEmp(emp.id)}>
                    <Text style={{ color: C.danger, fontSize: 12, fontWeight: '700' }}>REMOVE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'targets' && !loading && (
          <>
            <TouchableOpacity style={s.addBtn} onPress={openAddTgt} activeOpacity={0.85}>
              <Text style={s.addBtnText}>+ Add Target</Text>
            </TouchableOpacity>

            {targets.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyEmoji}>🎯</Text>
                <Text style={s.emptyText}>No completed targets yet</Text>
                <Text style={s.emptySub}>Tasks completed 100% will show here</Text>
              </View>
            )}

            {targets.map(target => (
              <View key={target.id} style={s.card}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: typeColorMap[target.type] }} />
                      <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 14 }}>{target.title}</Text>
                    </View>
                    <Text style={{ color: C.textMuted, fontSize: 12 }}>👤 {target.assignee}</Text>
                    <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>📅 {target.deadline}</Text>
                  </View>
                  <Text style={{ color: typeColorMap[target.type], fontWeight: '800', fontSize: 18 }}>{Math.round(target.progress * 100)}%</Text>
                </View>

                <ProgressBar progress={target.progress} color={typeColorMap[target.type]} height={8} />

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: C.accentSoft, borderRadius: RADIUS.sm, paddingVertical: 8, alignItems: 'center' }} onPress={() => openEditTgt(target)}>
                    <Text style={{ color: C.accent, fontSize: 12, fontWeight: '700' }}>UPDATE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: C.dangerSoft, borderRadius: RADIUS.sm, paddingVertical: 8, alignItems: 'center' }} onPress={() => handleDeleteTgt(target.id)}>
                    <Text style={{ color: C.danger, fontSize: 12, fontWeight: '700' }}>REMOVE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'ratings' && !loading && (
          <>
            <TouchableOpacity style={s.addBtn} onPress={openAddEmp} activeOpacity={0.85}>
              <Text style={s.addBtnText}>+ Add Employee</Text>
            </TouchableOpacity>

            {employees.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyEmoji}>⭐</Text>
                <Text style={s.emptyText}>No ratings yet</Text>
                <Text style={s.emptySub}>Task performers will show here automatically</Text>
              </View>
            )}

            {sorted.map(emp => (
              <View key={emp.id} style={[s.card, { flexDirection: 'row', alignItems: 'center' }]}>
                <Avatar name={emp.name} color={emp.color} size={44} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: C.textPrimary, fontWeight: '700', fontSize: 14 }}>{emp.name}</Text>
                  <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{emp.role}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 6, gap: 3 }}>
                    {[1,2,3,4,5].map(star => (
                      <Text key={star} style={{ color: star <= Math.round(emp.rating) ? '#FFD700' : C.surfaceAlt, fontSize: 14 }}>★</Text>
                    ))}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: ratingColor(emp.rating), fontWeight: '800', fontSize: 24 }}>{emp.rating.toFixed(1)}</Text>
                  <Text style={{ color: C.textMuted, fontSize: 10 }}>/ 5.0</Text>
                  <View style={{ marginTop: 6 }}>
                    <StatusBadge label="Excellent" type="success" />
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showEmpModal} transparent animationType="slide" onRequestClose={() => setShowEmpModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalSheet}>
            <View style={s.sheetHandle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={s.sheetTitle}>{editEmpId ? 'Edit Employee' : 'Add Employee'}</Text>
              <TouchableOpacity onPress={() => setShowEmpModal(false)}>
                <Text style={{ color: C.textMuted, fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                ['Full Name *', 'name', 'e.g. Priya Mehta'],
                ['Role / Designation', 'role', 'e.g. Backend Developer'],
                ['Rating (0–5)', 'rating', 'e.g. 5'],
                ['Attendance %', 'attendance', 'e.g. 100'],
                ['KPIs (Label:Value,...)', 'kpis', 'e.g. Code Quality:1,On-Time:1'],
              ].map(([label, key, ph]) => (
                <View key={key} style={{ marginBottom: 14 }}>
                  <Text style={s.fieldLabel}>{label}</Text>
                  <TextInput
                    value={empForm[key]}
                    onChangeText={v => setEmpForm(prev => ({ ...prev, [key]: v }))}
                    placeholder={ph}
                    placeholderTextColor={C.textMuted}
                    style={s.fieldInput}
                    keyboardType={['rating','attendance'].includes(key) ? 'decimal-pad' : 'default'}
                  />
                </View>
              ))}
              <Text style={[s.fieldLabel, { marginBottom: 4, color: C.textMuted + 'AA', fontSize: 11 }]}>KPI format: "Label:0.0 to 1.0" comma-separated</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setShowEmpModal(false)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.saveBtn, !empForm.name.trim() && { opacity: 0.4 }]} onPress={handleSaveEmp}>
                  <Text style={s.saveBtnText}>{editEmpId ? 'Save Changes' : 'Add Employee'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showTgtModal} transparent animationType="slide" onRequestClose={() => setShowTgtModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalSheet}>
            <View style={s.sheetHandle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={s.sheetTitle}>{editTgtId ? 'Edit Target' : 'Add Target'}</Text>
              <TouchableOpacity onPress={() => setShowTgtModal(false)}>
                <Text style={{ color: C.textMuted, fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                ['Target Title *', 'title', 'e.g. Acquire 50 new customers'],
                ['Assigned To', 'assignee', 'e.g. Sales Team'],
                ['Deadline', 'deadline', 'e.g. 30 Jun 2025'],
                ['Progress % (0–100)', 'progress', 'e.g. 100'],
              ].map(([label, key, ph]) => (
                <View key={key} style={{ marginBottom: 14 }}>
                  <Text style={s.fieldLabel}>{label}</Text>
                  <TextInput
                    value={tgtForm[key]}
                    onChangeText={v => setTgtForm(prev => ({ ...prev, [key]: v }))}
                    placeholder={ph}
                    placeholderTextColor={C.textMuted}
                    style={s.fieldInput}
                    keyboardType={key === 'progress' ? 'number-pad' : 'default'}
                  />
                </View>
              ))}

              <Text style={s.fieldLabel}>Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {TARGET_TYPES.map(type => {
                  const col = typeColorMap[type];
                  const active = tgtForm.type === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setTgtForm(prev => ({ ...prev, type }))}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full,
                        backgroundColor: active ? col + '30' : C.surfaceAlt,
                        borderWidth: 1, borderColor: active ? col : C.border,
                      }}
                    >
                      <Text style={{ color: active ? col : C.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{type}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setShowTgtModal(false)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.saveBtn, !tgtForm.title.trim() && { opacity: 0.4 }]} onPress={handleSaveTgt}>
                  <Text style={s.saveBtnText}>{editTgtId ? 'Save Changes' : 'Add Target'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 29, paddingBottom: 12,
    backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  addHeaderBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#2F6E8E", alignItems: 'center', justifyContent: 'center' },

  addBtn: {
    backgroundColor: "#2F6E8E", borderRadius: 12, paddingVertical: 13,
    alignItems: 'center', marginBottom: 16,
    shadowColor: "#2F6E8E", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  addBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: 50, gap: 10 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 17, color: C.text, fontWeight: '700' },
  emptySub: { fontSize: 13, color: C.textMuted },

  card: {
    backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  sectionTitle: { color: C.textPrimary, fontWeight: '800', fontSize: 15, marginBottom: 2 },
  sectionSub: { color: C.textMuted, fontSize: 12, marginBottom: 12 },

  modalSheet: {
    backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36, borderWidth: 1, borderColor: C.border, maxHeight: '90%',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#1a3a5c', alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    backgroundColor: C.surfaceAlt, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: C.border, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.textPrimary,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  cancelBtnText: { color: C.textMuted, fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: "#2F6E8E", alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backArrow: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  backLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});