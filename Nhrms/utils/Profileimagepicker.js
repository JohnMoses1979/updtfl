import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

export async function pickProfileImage() {
    try {
        if (Platform.OS === "web") {
            return new Promise((resolve) => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                        resolve(null);
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve(ev.target?.result || null);
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                };
                input.oncancel = () => resolve(null);
                input.click();
            });
        }

        if (
            typeof ImagePicker.requestMediaLibraryPermissionsAsync !== "function" ||
            typeof ImagePicker.launchImageLibraryAsync !== "function"
        ) {
            Alert.alert("Not Available", "Image picker is not available on this build.");
            return null;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "Please allow access to your photo library in Settings."
            );
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled || !result.assets?.length) {
            return null;
        }

        return result.assets[0].uri;
    } catch (err) {
        console.warn("[pickProfileImage] Error:", err.message);
        return null;
    }
}
