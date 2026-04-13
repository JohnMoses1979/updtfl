import { Alert, Platform } from 'react-native';

/**
 * pickProfileImage
 *
 * Opens the device image library and returns the selected image URI.
 * Uses expo-image-picker if available, falls back to a web file input.
 *
 * Returns: string URI on success, null if cancelled or failed.
 */
export async function pickProfileImage() {
    try {
        // ── Web fallback ──────────────────────────────────────────────────────
        if (Platform.OS === 'web') {
            return new Promise((resolve) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) { resolve(null); return; }
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve(ev.target.result); // base64 data URI
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                };
                input.oncancel = () => resolve(null);
                input.click();
            });
        }

        // ── Mobile: try expo-image-picker ──────────────────────────────────────
        let ImagePicker;
        try {
            ImagePicker = require('expo-image-picker');
        } catch (_) {
            Alert.alert(
                'Not Available',
                'Image picker is not available. Please install expo-image-picker.',
            );
            return null;
        }

        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photo library in Settings.',
            );
            return null;
        }

        // Launch picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        return result.assets[0].uri;
    } catch (err) {
        console.warn('[pickProfileImage] Error:', err.message);
        return null;
    }
}