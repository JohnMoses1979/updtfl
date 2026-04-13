import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput,
} from 'react-native';

export default function AppOptionPickerModal({
    visible,
    title = 'Select Option',
    options = [],
    selectedValue,
    onSelect,
    onClose,
}) {
    const [search, setSearch] = useState('');

    const filtered = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (option) => {
        onSelect(option);
        setSearch('');
        onClose();
    };

    const handleClose = () => {
        setSearch('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={s.overlay}>
                <View style={s.sheet}>
                    {/* Header */}
                    <View style={s.header}>
                        <Text style={s.title}>{title}</Text>
                        <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
                            <Text style={s.closeTxt}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    {options.length > 6 && (
                        <TextInput
                            style={s.search}
                            placeholder="Search..."
                            placeholderTextColor="#555"
                            value={search}
                            onChangeText={setSearch}
                        />
                    )}

                    {/* Options List */}
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item}
                        showsVerticalScrollIndicator={false}
                        style={s.list}
                        renderItem={({ item }) => {
                            const isSelected = item === selectedValue;
                            return (
                                <TouchableOpacity
                                    style={[s.option, isSelected && s.optionActive]}
                                    onPress={() => handleSelect(item)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[s.optionText, isSelected && s.optionTextActive]}>
                                        {item}
                                    </Text>
                                    {isSelected && <Text style={s.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <View style={s.empty}>
                                <Text style={s.emptyText}>No options found</Text>
                            </View>
                        }
                    />

                    {/* Cancel Button */}
                    <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
                        <Text style={s.cancelTxt}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        paddingHorizontal: 18,
    },
    sheet: {
        backgroundColor: '#0f1e30',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1a3a5c',
        maxHeight: '75%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    title: {
        color: '#F0EDE8',
        fontSize: 17,
        fontWeight: '800',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1a3a5c',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeTxt: {
        color: '#F0EDE8',
        fontSize: 14,
        fontWeight: '700',
    },
    search: {
        backgroundColor: '#13263b',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1a3a5c',
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: '#F0EDE8',
        marginBottom: 10,
    },
    list: {
        flexGrow: 0,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 4,
        backgroundColor: '#13263b',
        borderWidth: 1,
        borderColor: '#1a3a5c',
    },
    optionActive: {
        backgroundColor: '#2F6E8E',
        borderColor: '#2F6E8E',
    },
    optionText: {
        color: '#F0EDE8',
        fontSize: 15,
        fontWeight: '500',
    },
    optionTextActive: {
        color: '#ffffff',
        fontWeight: '700',
    },
    checkmark: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '800',
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyText: {
        color: '#7A7570',
        fontSize: 14,
    },
    cancelBtn: {
        marginTop: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1a3a5c',
        paddingVertical: 13,
        alignItems: 'center',
    },
    cancelTxt: {
        color: '#C8C4BE',
        fontSize: 14,
        fontWeight: '600',
    },
});