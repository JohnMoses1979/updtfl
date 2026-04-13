// adminscreens/Admintask.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AppDatePickerModal from '../components/AppDatePickerModal';
import { taskApi } from '../api/taskapi';
import { employeeApi } from '../api/employeeApi';

const C = {
  bg: '#112235',
  surface: '#0f1e30',
  surfaceAlt: '#0f2035',
  text: '#F0EDE8',
  textPrimary: '#F0EDE8',
  textSecondary: '#C8C4BE',
  textMuted: '#7A7570',
  border: '#1a3a5c',
  accent: '#4D6FFF',
  accentSoft: '#4D6FFF22',
  info: '#4D9EFF',
  warning: '#FFB830',
  danger: '#FF4D6D',
  dangerSoft: '#FF4D6D22',
  success: '#2DD4A0',
};

const RADIUS = { sm: 8, md: 12, lg: 16, full: 999 };
const ACCENT_COLORS = [
  '#4D6FFF', '#2F6E8E', '#9B59B6', '#27AE60',
  '#E74C3C', '#F39C12', '#2DD4BF', '#FF6B9D',
];

const priorityMap = {
  urgent: { color: C.danger },
  high: { color: C.warning },
  medium: { color: C.info },
  low: { color: C.success },
};

const statusMap = {
  'in-progress': { color: C.info, label: 'In Progress' },
  todo: { color: C.accent, label: 'To Do' },
  review: { color: C.warning, label: 'Review' },
  done: { color: C.success, label: 'Done' },
};

const EMPTY_FORM = {
  title: '',
  desc: '',
  assigneeEmployeeDbId: null,   // numeric employee table id
  assigneeEmployeeId: '',       // human readable empId like BSSE001
  assigneeName: '',
  due: '',
  priority: 'medium',
};

function initials(name = '') {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
}

function Avatar({ name, color, size = 28 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color || C.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: size * 0.36 }}>
        {initials(name)}
      </Text>
    </View>
  );
}

function ProgressBar({ progress, color }) {
  return (
    <View
      style={{
        height: 5,
        backgroundColor: C.border,
        borderRadius: RADIUS.full,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.round(progress * 100)}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: RADIUS.full,
        }}
      />
    </View>
  );
}

function StatusChip({ status }) {
  const meta = statusMap[status] || statusMap.todo;
  return (
    <View
      style={{
        backgroundColor: `${meta.color}22`,
        borderRadius: RADIUS.full,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: `${meta.color}44`,
      }}
    >
      <Text style={{ color: meta.color, fontSize: 11, fontWeight: '700' }}>
        {meta.label}
      </Text>
    </View>
  );
}

function Chip({ label, color }) {
  return (
    <View
      style={{
        backgroundColor: `${color}22`,
        borderRadius: RADIUS.full,
        paddingHorizontal: 8,
        paddingVertical: 2,
      }}
    >
      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

function mapAdminTask(task, index) {
  return {
    id: String(task.id),
    title: task.title || '',
    desc: task.description || '',
    assignee: task.assigneeName || 'Unassigned',
    assigneeEmployeeId: task.assigneeEmployeeId || '',
    assigneeEmployeeDbId: task.assigneeEmployeeDbId || task.assigneeId || null,
    due: task.dueText || '—',
    priority: (task.priority || 'medium').toLowerCase(),
    status: task.status || 'todo',
    progress: Math.max(0, Math.min(1, (task.progress || 0) / 100)),
    comments: task.commentsCount || 0,
    color: ACCENT_COLORS[index % ACCENT_COLORS.length],
  };
}

export default function TasksScreen({ onBack }) {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filters = ['all', 'todo', 'in-progress', 'review', 'done'];

  const selectedEmployee = useMemo(() => {
    if (form.assigneeEmployeeDbId) {
      return employees.find((e) => String(e.id) === String(form.assigneeEmployeeDbId)) || null;
    }
    if (form.assigneeEmployeeId) {
      return employees.find((e) => String(e.empId) === String(form.assigneeEmployeeId)) || null;
    }
    return null;
  }, [employees, form.assigneeEmployeeDbId, form.assigneeEmployeeId]);

  const filteredEmployees = useMemo(() => {
    const q = assigneeSearch.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((e) =>
      String(e.empId || '').toLowerCase().includes(q) ||
      String(e.name || '').toLowerCase().includes(q) ||
      String(e.designation || '').toLowerCase().includes(q) ||
      String(e.email || '').toLowerCase().includes(q)
    );
  }, [assigneeSearch, employees]);

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  useEffect(() => {
    loadTasks();
    loadEmployees();
  }, []);

  async function loadTasks(mode = 'load') {
    try {
      setError('');
      if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);

      const data = await taskApi.getAdminTasks();
      setTasks((data || []).map((item, index) => mapAdminTask(item, index)));
    } catch (e) {
      setError(e.message || 'Failed to load tasks');
    } finally {
      if (mode === 'refresh') setRefreshing(false);
      else setLoading(false);
    }
  }

  async function loadEmployees() {
    try {
      setLoadingEmployees(true);
      setError('');

      const empList = await employeeApi.getAll();
      const normalized = Array.isArray(empList) ? empList : [];

      setEmployees(normalized);
    } catch (e) {
      setEmployees([]);
      setError(e.message || 'Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  }

  function openAdd() {
    setEditId(null);
    setAssigneeSearch('');
    setForm(EMPTY_FORM);
    setError('');
    setShowAdd(true);
  }

  function openEdit(task) {
    setEditId(task.id);
    setAssigneeSearch('');
    setError('');
    setForm({
      title: task.title || '',
      desc: task.desc || '',
      assigneeEmployeeDbId: task.assigneeEmployeeDbId || null,
      assigneeEmployeeId: task.assigneeEmployeeId || '',
      assigneeName: task.assignee || '',
      due: task.due === '—' ? '' : task.due,
      priority: task.priority || 'medium',
    });
    setShowAdd(true);
  }

  function validateForm() {
    if (!form.title.trim()) {
      return 'Title is required';
    }

    if (!selectedEmployee) {
      return 'Please select an employee';
    }

    if (!selectedEmployee.id) {
      return 'Selected employee id is missing';
    }

    if (!selectedEmployee.empId) {
      return 'Selected employee code is missing';
    }

    if (!selectedEmployee.name) {
      return 'Selected employee name is missing';
    }

    return '';
  }

  async function handleSave() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        title: form.title.trim(),
        description: form.desc.trim(),
        assigneeId: selectedEmployee.id, // send employee.id in assigneeId
        assigneeEmployeeDbId: selectedEmployee.id,
        assigneeEmployeeId: selectedEmployee.empId,
        assigneeName: selectedEmployee.name,
        dueText: form.due.trim(),
        priority: form.priority,
      };

      if (editId) {
        await taskApi.updateTaskByAdmin(editId, payload);
      } else {
        await taskApi.createTask(payload);
      }

      setShowAdd(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      await Promise.all([loadTasks('refresh'), loadEmployees()]);
    } catch (e) {
      setError(e.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      setError('');
      await taskApi.deleteTask(id);
      await loadTasks('refresh');
    } catch (e) {
      setError(e.message || 'Failed to delete task');
    }
  }

  async function cycleStatus(task) {
    try {
      setError('');

      const order = ['todo', 'in-progress', 'review', 'done'];
      const next = order[(order.indexOf(task.status) + 1) % order.length];

      const payload = {
        title: task.title.trim(),
        description: task.desc.trim(),
        assigneeId: task.assigneeEmployeeDbId,
        assigneeEmployeeDbId: task.assigneeEmployeeDbId,
        assigneeEmployeeId: task.assigneeEmployeeId,
        assigneeName: task.assignee,
        dueText: task.due === '—' ? '' : task.due,
        priority: task.priority,
        status: next,
      };

      await taskApi.updateTaskByAdmin(task.id, payload);
      await loadTasks('refresh');
    } catch (e) {
      setError(e.message || 'Failed to update status');
    }
  }

  async function handleRefreshAll() {
    await Promise.all([loadTasks('refresh'), loadEmployees()]);
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backArrow}>‹</Text>
          <Text style={s.backLabel}>Admin</Text>
        </TouchableOpacity>

        <View>
          <Text style={s.headerTitle}>Task Management</Text>
          <Text style={s.headerSub}>Assign, track & complete</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={s.refreshHeaderBtn} onPress={handleRefreshAll}>
            <Text style={{ color: '#FFF', fontSize: 18, lineHeight: 20 }}>↻</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.addHeaderBtn} onPress={openAdd}>
            <Text style={{ color: '#FFF', fontSize: 22, lineHeight: 24 }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefreshAll} />
        }
      >
        <View style={{ padding: 16 }}>
          {!!error && (
            <Text style={{ color: '#ff9b9b', marginBottom: 10, fontSize: 12 }}>{error}</Text>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Total', value: tasks.length, color: C.accent },
              { label: 'Active', value: counts['in-progress'], color: C.info },
              { label: 'Review', value: counts.review, color: C.warning },
              { label: 'Done', value: counts.done, color: C.success },
            ].map((item) => (
              <View
                key={item.label}
                style={{
                  flex: 1,
                  backgroundColor: C.surface,
                  borderRadius: RADIUS.md,
                  padding: 10,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <Text style={{ color: item.color, fontSize: 20, fontWeight: '800' }}>
                  {item.value}
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {filters.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: RADIUS.full,
                  marginRight: 8,
                  backgroundColor: filter === item ? '#2F6E8E' : C.surface,
                  borderWidth: 1,
                  borderColor: filter === item ? '#2F6E8E' : C.border,
                }}
              >
                <Text
                  style={{
                    color: filter === item ? '#fff' : C.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {item}
                </Text>
                <View
                  style={{
                    backgroundColor: filter === item ? 'rgba(255,255,255,0.25)' : C.surfaceAlt,
                    borderRadius: RADIUS.full,
                    minWidth: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: filter === item ? '#fff' : C.textMuted,
                      fontSize: 10,
                      fontWeight: '700',
                    }}
                  >
                    {counts[item]}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={s.addBtn} onPress={openAdd} activeOpacity={0.85}>
            <Text style={s.addBtnText}>+ New Task</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={s.emptyState}>
              <ActivityIndicator size="large" color="#2F6E8E" />
              <Text style={s.emptyText}>Loading tasks…</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>✅</Text>
              <Text style={s.emptyText}>
                {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
              </Text>
              <Text style={s.emptySub}>Tap "+ New Task" to create one</Text>
            </View>
          ) : (
            filtered.map((task) => {
              const priorityMeta = priorityMap[task.priority] || priorityMap.medium;
              return (
                <View key={task.id} style={[s.taskCard, { borderLeftColor: priorityMeta.color }]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={s.taskTitle}>{task.title}</Text>
                      {!!task.desc && <Text style={s.taskDesc}>{task.desc}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => cycleStatus(task)}>
                      <StatusChip status={task.status} />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    <Chip label={task.priority.toUpperCase()} color={priorityMeta.color} />
                    <Chip label={task.assigneeEmployeeId || 'NA'} color={C.accent} />
                  </View>

                  {task.progress > 0 && (
                    <View style={{ marginBottom: 10 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ color: C.textMuted, fontSize: 11 }}>Progress</Text>
                        <Text style={{ color: C.textSecondary, fontSize: 11, fontWeight: '600' }}>
                          {Math.round(task.progress * 100)}%
                        </Text>
                      </View>
                      <ProgressBar
                        progress={task.progress}
                        color={task.progress === 1 ? C.success : '#2F6E8E'}
                      />
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: C.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Avatar name={task.assignee} color={task.color} size={26} />
                      <Text style={{ color: C.textSecondary, fontSize: 12 }}>
                        {task.assignee?.split(' ')?.[0] || 'Employee'}
                      </Text>
                    </View>

                    {!!task.due && task.due !== '—' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontSize: 11 }}>📅</Text>
                        <Text style={{ color: C.textMuted, fontSize: 12 }}>Due {task.due}</Text>
                      </View>
                    )}

                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: C.accentSoft,
                          borderRadius: RADIUS.sm,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                        }}
                        onPress={() => openEdit(task)}
                      >
                        <Text style={{ color: C.accent, fontSize: 11, fontWeight: '700' }}>
                          EDIT
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          backgroundColor: C.dangerSoft,
                          borderRadius: RADIUS.sm,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                        }}
                        onPress={() => handleDelete(task.id)}
                      >
                        <Text style={{ color: C.danger, fontSize: 11, fontWeight: '700' }}>
                          DEL
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={s.modalSheet}>
            <View style={s.sheetHandle} />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={s.sheetTitle}>{editId ? 'Edit Task' : 'New Task'}</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Text style={{ color: C.textMuted, fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {!!error && (
                <Text style={{ color: '#ff9b9b', marginBottom: 12, fontSize: 12 }}>{error}</Text>
              )}

              <View style={{ marginBottom: 14 }}>
                <Text style={s.fieldLabel}>Title *</Text>
                <TextInput
                  value={form.title}
                  onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
                  placeholder="Task title..."
                  placeholderTextColor={C.textMuted}
                  style={s.fieldInput}
                />
              </View>

              <View style={{ marginBottom: 14 }}>
                <Text style={s.fieldLabel}>Description</Text>
                <TextInput
                  value={form.desc}
                  onChangeText={(v) => setForm((p) => ({ ...p, desc: v }))}
                  placeholder="Describe the task..."
                  placeholderTextColor={C.textMuted}
                  style={s.fieldInput}
                />
              </View>

              <View style={{ marginBottom: 14 }}>
                <Text style={s.fieldLabel}>Assign To *</Text>
                <TouchableOpacity
                  style={s.fieldInput}
                  activeOpacity={0.85}
                  onPress={() => setShowAssigneePicker(true)}
                >
                  <Text style={{ color: selectedEmployee ? C.textPrimary : C.textMuted, fontSize: 15 }}>
                    {selectedEmployee
                      ? `${selectedEmployee.name} (${selectedEmployee.empId})`
                      : loadingEmployees
                        ? 'Loading employees…'
                        : 'Select employee'}
                  </Text>
                </TouchableOpacity>

                {selectedEmployee && (
                  <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 4, marginLeft: 2 }}>
                    {selectedEmployee.designation || 'Employee'}
                  </Text>
                )}
              </View>

              <View style={{ marginBottom: 14 }}>
                <Text style={s.fieldLabel}>Due Date</Text>
                <TouchableOpacity
                  style={s.fieldInput}
                  activeOpacity={0.85}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: form.due ? C.textPrimary : C.textMuted, fontSize: 15 }}>
                    {form.due || 'Select due date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={s.fieldLabel}>Priority</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                {['low', 'medium', 'high', 'urgent'].map((priority) => {
                  const color = priorityMap[priority]?.color || '#2F6E8E';
                  const active = form.priority === priority;
                  return (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => setForm((p) => ({ ...p, priority }))}
                      style={{
                        flex: 1,
                        paddingVertical: 9,
                        borderRadius: RADIUS.sm,
                        alignItems: 'center',
                        backgroundColor: active ? `${color}30` : C.surfaceAlt,
                        borderWidth: 1,
                        borderColor: active ? color : C.border,
                      }}
                    >
                      <Text
                        style={{
                          color: active ? color : C.textMuted,
                          fontSize: 11,
                          fontWeight: '700',
                          textTransform: 'capitalize',
                        }}
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setShowAdd(false)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  activeOpacity={0.85}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.saveBtnText}>{editId ? 'Save Changes' : 'Create Task'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AppDatePickerModal
        visible={showDatePicker}
        value={form.due}
        onClose={() => setShowDatePicker(false)}
        onChange={(value) => setForm((p) => ({ ...p, due: value }))}
      />

      <Modal
        visible={showAssigneePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAssigneePicker(false)}
      >
        <View style={s.assigneeOverlay}>
          <View style={s.assigneeSheet}>
            <Text style={s.sheetTitle}>Select Employee</Text>

            <TextInput
              value={assigneeSearch}
              onChangeText={setAssigneeSearch}
              placeholder="Search by name, ID, designation or email"
              placeholderTextColor={C.textMuted}
              style={[s.fieldInput, { marginBottom: 14 }]}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              {loadingEmployees ? (
                <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                  <ActivityIndicator size="small" color="#2F6E8E" />
                  <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 8 }}>
                    Loading employees…
                  </Text>
                </View>
              ) : filteredEmployees.length === 0 ? (
                <Text style={s.assigneeEmpty}>
                  {employees.length === 0
                    ? 'No employees found. Add employees first.'
                    : 'No employees match your search.'}
                </Text>
              ) : (
                filteredEmployees.map((emp) => {
                  const active = String(form.assigneeEmployeeDbId) === String(emp.id);
                  return (
                    <TouchableOpacity
                      key={emp.id}
                      style={[s.assigneeOption, active && s.assigneeOptionActive]}
                      onPress={() => {
                        setForm((p) => ({
                          ...p,
                          assigneeEmployeeDbId: emp.id,
                          assigneeEmployeeId: emp.empId,
                          assigneeName: emp.name,
                        }));
                        setShowAssigneePicker(false);
                        setAssigneeSearch('');
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: active ? '#2F6E8E33' : C.surfaceAlt,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color: active ? '#2F6E8E' : C.textMuted,
                              fontWeight: '700',
                              fontSize: 13,
                            }}
                          >
                            {initials(emp.name)}
                          </Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={[s.assigneeName, active && s.assigneeNameActive]}>
                            {emp.name}
                          </Text>
                          <Text style={s.assigneeMeta}>
                            {emp.empId}
                            {emp.designation ? ` · ${emp.designation}` : ''}
                            {emp.email ? ` · ${emp.email}` : ''}
                          </Text>
                        </View>

                        {active && <Text style={{ color: '#2F6E8E', fontSize: 16 }}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => {
                setShowAssigneePicker(false);
                setAssigneeSearch('');
              }}
            >
              <Text style={s.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 29,
    paddingBottom: 12,
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  addHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2F6E8E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a3a5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: '#2F6E8E',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2F6E8E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  addBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 17, color: C.text, fontWeight: '700' },
  emptySub: { fontSize: 13, color: C.textMuted },
  taskCard: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 3,
  },
  taskTitle: { color: C.textPrimary, fontWeight: '700', fontSize: 14, marginBottom: 3 },
  taskDesc: { color: C.textMuted, fontSize: 12, lineHeight: 17 },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: C.border,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1a3a5c',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: C.surfaceAlt,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: C.textPrimary,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  cancelBtnText: { color: C.textMuted, fontSize: 15, fontWeight: '600' },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: '#2F6E8E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  assigneeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  assigneeSheet: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    maxHeight: '75%',
  },
  assigneeOption: {
    backgroundColor: C.surfaceAlt,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  assigneeOptionActive: { borderColor: C.accent, backgroundColor: C.accentSoft },
  assigneeName: { color: C.textPrimary, fontSize: 14, fontWeight: '700' },
  assigneeNameActive: { color: C.accent },
  assigneeMeta: { color: C.textMuted, fontSize: 12, marginTop: 4 },
  assigneeEmpty: { color: C.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6 },
  backArrow: { color: '#2F6E8E', fontSize: 24, fontWeight: '700', marginRight: 4 },
  backLabel: { color: C.text, fontSize: 14, fontWeight: '600' },
});