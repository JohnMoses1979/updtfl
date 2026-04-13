/**
 * userscreens/Personaldetails.js
 *
 * FIXED:
 *  1. Country/State/City use real AppOptionPickerModal (same as AdminPersonalScreen)
 *  2. Date of Birth uses AppDatePickerModal
 *  3. Profile image pick via Profileimagepicker utility
 *  4. All form data saves to PUT /api/employees/profile/{empId}
 *  5. Avatar shows initials or picked image
 *  6. Full address field works with multiline TextInput
 */

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Platform,
//   Alert,
//   StatusBar,
//   useWindowDimensions,
//   Image,
// } from "react-native";

// import AppDatePickerModal from "../components/AppDatePickerModal";
// import AppOptionPickerModal from "../components/AppOptionPickerModal";
// import { pickProfileImage } from "../utils/Profileimagepicker";
// import { BASE_URL } from "../api/config";
// import { useUser } from "../context/UserContext";

// // ── India location data ────────────────────────────────────────────────────
// const INDIA_LOCATION_OPTIONS = {
//   India: {
//     "Andhra Pradesh": [
//       "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
//       "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Eluru",
//     ],
//     Telangana: [
//       "Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam",
//       "Ramagundam", "Mahabubnagar", "Nalgonda", "Adilabad", "Suryapet",
//     ],
//     Karnataka: [
//       "Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum",
//       "Davangere", "Bellary", "Bijapur", "Shimoga", "Gulbarga",
//     ],
//     Maharashtra: [
//       "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
//       "Solapur", "Kolhapur", "Thane", "Amravati", "Nanded",
//     ],
//     "Tamil Nadu": [
//       "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
//       "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Dindigul",
//     ],
//     Delhi: [
//       "New Delhi", "Dwarka", "Rohini", "Janakpuri", "Saket",
//       "Lajpat Nagar", "Karol Bagh", "Connaught Place", "Vasant Kunj", "Pitampura",
//     ],
//     Gujarat: [
//       "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
//       "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Morbi",
//     ],
//     Rajasthan: [
//       "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer",
//       "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar",
//     ],
//     "Uttar Pradesh": [
//       "Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut",
//       "Prayagraj", "Ghaziabad", "Noida", "Firozabad", "Bareilly",
//     ],
//     "West Bengal": [
//       "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
//       "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur",
//     ],
//   },
// };

// const C = {
//   bg: "#112235",
//   orange: "#2F6E8E",
//   white: "#FFFFFF",
//   gray: "#AAAAAA",
//   darkCard: "#0f1e30",
//   border: "#1a3a5c",
//   avatarBg: "#163352",
// };

// // ── Top Navigation ─────────────────────────────────────────────────────────
// function TopNav({ onBack }) {
//   return (
//     <View style={styles.topNav}>
//       <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
//         <Text style={styles.backArrow}>←</Text>
//       </TouchableOpacity>
//       <Text style={styles.navTitle}>Personal Data</Text>
//       <View style={styles.rightSpace} />
//     </View>
//   );
// }

// // ── Section Label ──────────────────────────────────────────────────────────
// function SectionLabel({ title, sub }) {
//   return (
//     <View style={styles.sectionLbl}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       {!!sub && <Text style={styles.sectionSub}>{sub}</Text>}
//     </View>
//   );
// }

// // ── Text Input Field ────────────────────────────────────────────────────────
// function Field({ label, icon, value, onChange, placeholder, multiline = false, keyboardType = "default" }) {
//   return (
//     <View style={styles.fieldWrap}>
//       <Text style={styles.fieldLabel}>{label}</Text>
//       <View style={[styles.fieldBox, multiline && styles.fieldBoxMultiline]}>
//         {!!icon && <Text style={styles.fieldIcon}>{icon}</Text>}
//         <TextInput
//           style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
//           value={value}
//           onChangeText={onChange}
//           placeholder={placeholder}
//           placeholderTextColor="#555"
//           multiline={multiline}
//           keyboardType={keyboardType}
//           textAlignVertical={multiline ? "top" : "center"}
//         />
//       </View>
//     </View>
//   );
// }

// // ── Dropdown Field ──────────────────────────────────────────────────────────
// function DropdownField({ label, icon, value, placeholder, onPress }) {
//   return (
//     <View style={styles.fieldWrap}>
//       <Text style={styles.fieldLabel}>{label}</Text>
//       <TouchableOpacity style={styles.fieldBox} onPress={onPress} activeOpacity={0.8}>
//         {!!icon && <Text style={styles.fieldIcon}>{icon}</Text>}
//         <Text style={[styles.fieldInput, !value && styles.placeholderText]} numberOfLines={1}>
//           {value || placeholder}
//         </Text>
//         <Text style={styles.dropdownArrow}>⌄</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// // ── Avatar Section ──────────────────────────────────────────────────────────
// function AvatarSection({ firstName, lastName, avatarUri, onPickImage, onRemoveImage }) {
//   const initials = `${firstName?.trim?.()?.[0] || ""}${lastName?.trim?.()?.[0] || ""}`.toUpperCase();

//   return (
//     <View style={styles.photoSection}>
//       <View style={styles.photoWrap}>
//         <View style={styles.avatarBox}>
//           {avatarUri ? (
//             <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
//           ) : initials ? (
//             <Text style={styles.avatarInitials}>{initials}</Text>
//           ) : (
//             <Text style={styles.avatarFallback}>👤</Text>
//           )}
//         </View>

//         <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8} onPress={onPickImage}>
//           <Text style={styles.cameraText}>📷</Text>
//         </TouchableOpacity>

//         {!!avatarUri && (
//           <TouchableOpacity style={styles.removeBtn} activeOpacity={0.8} onPress={onRemoveImage}>
//             <Text style={styles.removeText}>✕</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//       <Text style={styles.uploadLabel}>Upload Photo</Text>
//       <Text style={styles.uploadHint}>JPG or PNG, minimum 800×800px, max 5MB</Text>
//     </View>
//   );
// }

// // ── Main Screen ─────────────────────────────────────────────────────────────
// export default function PersonalDataScreen({ onBack, onSave, initialData = {} }) {
//   const { user } = useUser();
//   const { width } = useWindowDimensions();
//   const isSmallPhone = width < 360;

//   // Form state
//   const [firstName, setFirstName] = useState(initialData.firstName || "");
//   const [lastName, setLastName] = useState(initialData.lastName || "");
//   const [dob, setDob] = useState(initialData.dob || "");
//   const [designation, setDesignation] = useState(initialData.designation || user?.designation || "");
//   const [country, setCountry] = useState(initialData.country || "India");
//   const [state, setState] = useState(initialData.state || "");
//   const [city, setCity] = useState(initialData.city || "");
//   const [address, setAddress] = useState(initialData.address || "");
//   const [avatarUri, setAvatarUri] = useState(initialData.avatarUri || "");
//   const [saving, setSaving] = useState(false);

//   // Modal visibility
//   const [dobPickerVisible, setDobPickerVisible] = useState(false);
//   const [activeLocationPicker, setActiveLocationPicker] = useState(null); // "country"|"state"|"city"

//   // Derived location options
//   const countryOptions = useMemo(() => Object.keys(INDIA_LOCATION_OPTIONS), []);

//   const stateOptions = useMemo(() => {
//     if (!country || !INDIA_LOCATION_OPTIONS[country]) return [];
//     return Object.keys(INDIA_LOCATION_OPTIONS[country]);
//   }, [country]);

//   const cityOptions = useMemo(() => {
//     if (!country || !state) return [];
//     return INDIA_LOCATION_OPTIONS[country]?.[state] || [];
//   }, [country, state]);

//   // Reset state/city when country changes
//   useEffect(() => {
//     if (!INDIA_LOCATION_OPTIONS[country]) {
//       setCountry("India");
//       setState("");
//       setCity("");
//     }
//   }, [country]);

//   useEffect(() => {
//     if (state && !stateOptions.includes(state)) {
//       setState("");
//       setCity("");
//     }
//   }, [state, stateOptions]);

//   useEffect(() => {
//     if (city && !cityOptions.includes(city)) {
//       setCity("");
//     }
//   }, [city, cityOptions]);

//   // ── Image picker ────────────────────────────────────────────────────────
//   const handlePickImage = async () => {
//     const uri = await pickProfileImage();
//     if (uri) setAvatarUri(uri);
//   };

//   // ── Save to backend ─────────────────────────────────────────────────────
//   const handleUpdate = async () => {
//     const empId = user?.empId;
//     if (!empId) {
//       Alert.alert("Error", "No employee ID found. Please log in again.");
//       return;
//     }

//     const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

//     const payload = {
//       firstName: firstName.trim(),
//       lastName: lastName.trim(),
//       name: fullName || undefined,
//       dob,
//       designation: designation.trim(),
//       country,
//       state,
//       city,
//       address: address.trim(),
//       avatarUri,
//     };

//     setSaving(true);
//     try {
//       const res = await fetch(`${BASE_URL}/api/employees/profile/${empId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errData = await res.json().catch(() => ({}));
//         throw new Error(errData.message || `Server error ${res.status}`);
//       }

//       Alert.alert("✅ Updated", "Personal data saved successfully.");
//       onSave?.(payload);
//     } catch (err) {
//       Alert.alert("Error", err.message || "Failed to save personal data.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Location picker helpers ──────────────────────────────────────────────
//   const openLocationPicker = (type) => {
//     if (type === "state" && !country) {
//       Alert.alert("Select Country", "Please select a country first.");
//       return;
//     }
//     if (type === "city" && !state) {
//       Alert.alert("Select State", "Please select a state first.");
//       return;
//     }
//     setActiveLocationPicker(type);
//   };

//   const handleCountrySelect = (val) => {
//     setCountry(val);
//     setState("");
//     setCity("");
//   };

//   const handleStateSelect = (val) => {
//     setState(val);
//     setCity("");
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={C.bg} />

//       <TopNav onBack={onBack} />

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={[styles.scrollContent, { paddingBottom: isSmallPhone ? 120 : 130 }]}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//       >
//         <SectionLabel title="My Personal Data" sub="Update your personal information below" />

//         {/* Avatar */}
//         <AvatarSection
//           firstName={firstName}
//           lastName={lastName}
//           avatarUri={avatarUri}
//           onPickImage={handlePickImage}
//           onRemoveImage={() => setAvatarUri("")}
//         />

//         {/* Name */}
//         <Field
//           label="First Name"
//           icon="👤"
//           value={firstName}
//           onChange={setFirstName}
//           placeholder="Enter first name"
//         />
//         <Field
//           label="Last Name"
//           icon="👤"
//           value={lastName}
//           onChange={setLastName}
//           placeholder="Enter last name"
//         />

//         {/* Date of Birth */}
//         <DropdownField
//           label="Date of Birth"
//           icon="📅"
//           value={dob}
//           placeholder="Select date of birth"
//           onPress={() => setDobPickerVisible(true)}
//         />

//         {/* Designation */}
//         <Field
//           label="Designation"
//           icon="🪪"
//           value={designation}
//           onChange={setDesignation}
//           placeholder="e.g. Software Developer"
//         />

//         {/* Address Section */}
//         <View style={styles.addressSection}>
//           <Text style={styles.addressTitle}>📍 Address</Text>
//           <Text style={styles.addressSub}>Your current domicile</Text>
//         </View>

//         {/* Country */}
//         <DropdownField
//           label="Country"
//           icon="🌍"
//           value={country}
//           placeholder="Select country"
//           onPress={() => openLocationPicker("country")}
//         />

//         {/* State */}
//         <DropdownField
//           label="State"
//           icon="🗺️"
//           value={state}
//           placeholder={country ? "Select state" : "Select country first"}
//           onPress={() => openLocationPicker("state")}
//         />

//         {/* City */}
//         <DropdownField
//           label="City"
//           icon="🏙️"
//           value={city}
//           placeholder={state ? "Select city" : "Select state first"}
//           onPress={() => openLocationPicker("city")}
//         />

//         {/* Full Address */}
//         <Field
//           label="Full Address"
//           icon="🏠"
//           value={address}
//           onChange={setAddress}
//           placeholder="Door no., Street, Landmark..."
//           multiline
//         />
//       </ScrollView>

//       {/* Save Button */}
//       <View style={styles.updateWrap}>
//         <TouchableOpacity
//           style={[styles.updateBtn, saving && { opacity: 0.65 }]}
//           onPress={handleUpdate}
//           activeOpacity={0.85}
//           disabled={saving}
//         >
//           <Text style={styles.updateTxt}>{saving ? "Saving..." : "Update Profile"}</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Date Picker Modal */}
//       <AppDatePickerModal
//         visible={dobPickerVisible}
//         value={dob}
//         onClose={() => setDobPickerVisible(false)}
//         onChange={setDob}
//       />

//       {/* Country Picker */}
//       <AppOptionPickerModal
//         visible={activeLocationPicker === "country"}
//         title="Select Country"
//         options={countryOptions}
//         selectedValue={country}
//         onSelect={handleCountrySelect}
//         onClose={() => setActiveLocationPicker(null)}
//       />

//       {/* State Picker */}
//       <AppOptionPickerModal
//         visible={activeLocationPicker === "state"}
//         title="Select State"
//         options={stateOptions}
//         selectedValue={state}
//         onSelect={handleStateSelect}
//         onClose={() => setActiveLocationPicker(null)}
//       />

//       {/* City Picker */}
//       <AppOptionPickerModal
//         visible={activeLocationPicker === "city"}
//         title="Select City"
//         options={cityOptions}
//         selectedValue={city}
//         onSelect={setCity}
//         onClose={() => setActiveLocationPicker(null)}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: C.bg,
//   },
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 130,
//   },

//   // ── Top Nav ──
//   topNav: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
//     paddingBottom: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//   },
//   backBtn: {
//     width: 40, height: 40, borderRadius: 20,
//     backgroundColor: C.darkCard,
//     alignItems: "center", justifyContent: "center",
//   },
//   backArrow: { color: C.white, fontSize: 18, fontWeight: "700" },
//   navTitle: {
//     flex: 1, color: C.white, fontSize: 17,
//     fontWeight: "700", textAlign: "center",
//   },
//   rightSpace: { width: 40 },

//   // ── Section Label ──
//   sectionLbl: { marginTop: 20, marginBottom: 8 },
//   sectionTitle: { color: C.gray, fontSize: 12, fontWeight: "600", marginBottom: 4 },
//   sectionSub: { color: "#555", fontSize: 12, lineHeight: 18 },

//   // ── Avatar ──
//   photoSection: { alignItems: "center", marginVertical: 18 },
//   photoWrap: { position: "relative" },
//   avatarBox: {
//     width: 108, height: 108, borderRadius: 54,
//     backgroundColor: C.avatarBg,
//     alignItems: "center", justifyContent: "center",
//     overflow: "hidden",
//     borderWidth: 2, borderColor: C.border,
//   },
//   avatarImage: { width: "100%", height: "100%" },
//   avatarInitials: { color: C.white, fontSize: 30, fontWeight: "800" },
//   avatarFallback: { fontSize: 42, color: C.white },
//   cameraBtn: {
//     position: "absolute", right: 0, bottom: 0,
//     width: 32, height: 32, borderRadius: 16,
//     backgroundColor: "#2F6E8E",
//     alignItems: "center", justifyContent: "center",
//     borderWidth: 2, borderColor: C.bg,
//   },
//   cameraText: { fontSize: 14 },
//   removeBtn: {
//     position: "absolute", right: -2, top: -2,
//     width: 28, height: 28, borderRadius: 14,
//     backgroundColor: "#E11D48",
//     alignItems: "center", justifyContent: "center",
//     borderWidth: 2, borderColor: C.bg,
//   },
//   removeText: { color: C.white, fontSize: 14, fontWeight: "800", lineHeight: 16 },
//   uploadLabel: { color: C.orange, fontSize: 14, fontWeight: "600", marginTop: 10, marginBottom: 4 },
//   uploadHint: { color: "#555", fontSize: 11, textAlign: "center", lineHeight: 17, paddingHorizontal: 20 },

//   // ── Field ──
//   fieldWrap: { marginBottom: 14 },
//   fieldLabel: { color: C.gray, fontSize: 13, marginBottom: 7 },
//   fieldBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: C.darkCard,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: C.border,
//     paddingHorizontal: 14,
//     minHeight: 54,
//   },
//   fieldBoxMultiline: {
//     minHeight: 96,
//     alignItems: "flex-start",
//     paddingTop: 12,
//     paddingBottom: 12,
//   },
//   fieldIcon: { fontSize: 15, marginRight: 10, marginTop: Platform.OS === "ios" ? 0 : 1 },
//   fieldInput: { flex: 1, color: C.white, fontSize: 14, paddingVertical: 0 },
//   fieldInputMultiline: { textAlignVertical: "top", minHeight: 70 },
//   placeholderText: { color: "#555" },
//   dropdownArrow: { color: C.orange, fontSize: 16, marginLeft: 10 },

//   // ── Address Section ──
//   addressSection: {
//     marginTop: 24, marginBottom: 16,
//     paddingTop: 20,
//     borderTopWidth: 1, borderTopColor: C.border,
//   },
//   addressTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
//   addressSub: { color: C.gray, fontSize: 12, marginTop: 3 },

//   // ── Update Button ──
//   updateWrap: {
//     position: "absolute", left: 0, right: 0, bottom: 0,
//     backgroundColor: C.bg,
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === "ios" ? 30 : 18,
//     borderTopWidth: 1, borderTopColor: C.border,
//   },
//   updateBtn: {
//     backgroundColor: "#2F6E8E",
//     borderRadius: 30,
//     minHeight: 54,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   updateTxt: { color: C.white, fontSize: 16, fontWeight: "700" },
// });





















/**
 * userscreens/Personaldetails.js
 *
 * FIXES:
 *  1. After successful save, calls updateProfile() on UserContext so the
 *     name persists across navigation/reload.
 *  2. Initialises firstName/lastName from existing user context data.
 *  3. All original styles UNTOUCHED.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  StatusBar,
  useWindowDimensions,
  Image,
} from "react-native";

import AppDatePickerModal from "../components/AppDatePickerModal";
import AppOptionPickerModal from "../components/AppOptionPickerModal";
import { pickProfileImage } from "../utils/Profileimagepicker";
import { BASE_URL } from "../api/config";
import { useUser } from "../context/UserContext";

// ── India location data ────────────────────────────────────────────────────
const INDIA_LOCATION_OPTIONS = {
  India: {
    "Andhra Pradesh": [
      "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
      "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Eluru",
    ],
    Telangana: [
      "Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam",
      "Ramagundam", "Mahabubnagar", "Nalgonda", "Adilabad", "Suryapet",
    ],
    Karnataka: [
      "Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum",
      "Davangere", "Bellary", "Bijapur", "Shimoga", "Gulbarga",
    ],
    Maharashtra: [
      "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
      "Solapur", "Kolhapur", "Thane", "Amravati", "Nanded",
    ],
    "Tamil Nadu": [
      "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
      "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Dindigul",
    ],
    Delhi: [
      "New Delhi", "Dwarka", "Rohini", "Janakpuri", "Saket",
      "Lajpat Nagar", "Karol Bagh", "Connaught Place", "Vasant Kunj", "Pitampura",
    ],
    Gujarat: [
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
      "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Morbi",
    ],
    Rajasthan: [
      "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer",
      "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar",
    ],
    "Uttar Pradesh": [
      "Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut",
      "Prayagraj", "Ghaziabad", "Noida", "Firozabad", "Bareilly",
    ],
    "West Bengal": [
      "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
      "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur",
    ],
  },
};

const C = {
  bg: "#112235",
  orange: "#2F6E8E",
  white: "#FFFFFF",
  gray: "#AAAAAA",
  darkCard: "#0f1e30",
  border: "#1a3a5c",
  avatarBg: "#163352",
};

function TopNav({ onBack }) {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.navTitle}>Personal Data</Text>
      <View style={styles.rightSpace} />
    </View>
  );
}

function SectionLabel({ title, sub }) {
  return (
    <View style={styles.sectionLbl}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!sub && <Text style={styles.sectionSub}>{sub}</Text>}
    </View>
  );
}

function Field({ label, icon, value, onChange, placeholder, multiline = false, keyboardType = "default" }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, multiline && styles.fieldBoxMultiline]}>
        {!!icon && <Text style={styles.fieldIcon}>{icon}</Text>}
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#555"
          multiline={multiline}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    </View>
  );
}

function DropdownField({ label, icon, value, placeholder, onPress }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.fieldBox} onPress={onPress} activeOpacity={0.8}>
        {!!icon && <Text style={styles.fieldIcon}>{icon}</Text>}
        <Text style={[styles.fieldInput, !value && styles.placeholderText]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>⌄</Text>
      </TouchableOpacity>
    </View>
  );
}

function AvatarSection({ firstName, lastName, avatarUri, onPickImage, onRemoveImage }) {
  const initials = `${firstName?.trim?.()?.[0] || ""}${lastName?.trim?.()?.[0] || ""}`.toUpperCase();

  return (
    <View style={styles.photoSection}>
      <View style={styles.photoWrap}>
        <View style={styles.avatarBox}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : initials ? (
            <Text style={styles.avatarInitials}>{initials}</Text>
          ) : (
            <Text style={styles.avatarFallback}>👤</Text>
          )}
        </View>

        <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8} onPress={onPickImage}>
          <Text style={styles.cameraText}>📷</Text>
        </TouchableOpacity>

        {!!avatarUri && (
          <TouchableOpacity style={styles.removeBtn} activeOpacity={0.8} onPress={onRemoveImage}>
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.uploadLabel}>Upload Photo</Text>
      <Text style={styles.uploadHint}>JPG or PNG, minimum 800×800px, max 5MB</Text>
    </View>
  );
}

export default function PersonalDataScreen({ onBack, onSave, initialData = {} }) {
  const { user, updateProfile } = useUser();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;

  // ── Initialise from UserContext or initialData ─────────────
  const [firstName, setFirstName] = useState(
    initialData.firstName || user?.firstName || (user?.name ? user.name.split(" ")[0] : "") || ""
  );
  const [lastName, setLastName] = useState(
    initialData.lastName || user?.lastName ||
    (user?.name && user.name.split(" ").length > 1 ? user.name.split(" ").slice(1).join(" ") : "") || ""
  );
  const [dob, setDob] = useState(initialData.dob || user?.dob || "");
  const [designation, setDesignation] = useState(
    initialData.designation || user?.designation || ""
  );
  const [country, setCountry] = useState(initialData.country || user?.country || "India");
  const [state, setState] = useState(initialData.state || user?.state || "");
  const [city, setCity] = useState(initialData.city || user?.city || "");
  const [address, setAddress] = useState(initialData.address || user?.address || "");
  const [avatarUri, setAvatarUri] = useState(
    initialData.avatarUri || user?.avatarUri || ""
  );
  const [saving, setSaving] = useState(false);

  const [dobPickerVisible, setDobPickerVisible] = useState(false);
  const [activeLocationPicker, setActiveLocationPicker] = useState(null);

  const countryOptions = useMemo(() => Object.keys(INDIA_LOCATION_OPTIONS), []);

  const stateOptions = useMemo(() => {
    if (!country || !INDIA_LOCATION_OPTIONS[country]) return [];
    return Object.keys(INDIA_LOCATION_OPTIONS[country]);
  }, [country]);

  const cityOptions = useMemo(() => {
    if (!country || !state) return [];
    return INDIA_LOCATION_OPTIONS[country]?.[state] || [];
  }, [country, state]);

  useEffect(() => {
    if (!INDIA_LOCATION_OPTIONS[country]) {
      setCountry("India");
      setState("");
      setCity("");
    }
  }, [country]);

  useEffect(() => {
    if (state && !stateOptions.includes(state)) {
      setState("");
      setCity("");
    }
  }, [state, stateOptions]);

  useEffect(() => {
    if (city && !cityOptions.includes(city)) {
      setCity("");
    }
  }, [city, cityOptions]);

  const handlePickImage = async () => {
    const uri = await pickProfileImage();
    if (uri) setAvatarUri(uri);
  };

  // ── Save to backend AND update UserContext ─────────────────
  const handleUpdate = async () => {
    const empId = user?.empId;
    if (!empId) {
      Alert.alert("Error", "No employee ID found. Please log in again.");
      return;
    }

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const fullName = `${trimmedFirst} ${trimmedLast}`.trim();

    const payload = {
      firstName: trimmedFirst,
      lastName: trimmedLast,
      name: fullName || undefined,
      dob,
      designation: designation.trim(),
      country,
      state,
      city,
      address: address.trim(),
      avatarUri,
    };

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/employees/profile/${empId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server error ${res.status}`);
      }

      // ── FIX: persist updated profile in UserContext ────────
      updateProfile({
        name: fullName || user?.name,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        dob,
        designation: designation.trim(),
        country,
        state,
        city,
        address: address.trim(),
        avatarUri,
      });

      Alert.alert("✅ Updated", "Personal data saved successfully.");
      onSave?.(payload);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save personal data.");
    } finally {
      setSaving(false);
    }
  };

  const openLocationPicker = (type) => {
    if (type === "state" && !country) {
      Alert.alert("Select Country", "Please select a country first.");
      return;
    }
    if (type === "city" && !state) {
      Alert.alert("Select State", "Please select a state first.");
      return;
    }
    setActiveLocationPicker(type);
  };

  const handleCountrySelect = (val) => { setCountry(val); setState(""); setCity(""); };
  const handleStateSelect = (val) => { setState(val); setCity(""); };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <TopNav onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: isSmallPhone ? 120 : 130 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionLabel title="My Personal Data" sub="Update your personal information below" />

        <AvatarSection
          firstName={firstName}
          lastName={lastName}
          avatarUri={avatarUri}
          onPickImage={handlePickImage}
          onRemoveImage={() => setAvatarUri("")}
        />

        <Field label="First Name" icon="👤" value={firstName} onChange={setFirstName} placeholder="Enter first name" />
        <Field label="Last Name" icon="👤" value={lastName} onChange={setLastName} placeholder="Enter last name" />

        <DropdownField
          label="Date of Birth" icon="📅"
          value={dob} placeholder="Select date of birth"
          onPress={() => setDobPickerVisible(true)}
        />

        <Field
          label="Designation" icon="🪪"
          value={designation} onChange={setDesignation}
          placeholder="e.g. Software Developer"
        />

        <View style={styles.addressSection}>
          <Text style={styles.addressTitle}>📍 Address</Text>
          <Text style={styles.addressSub}>Your current domicile</Text>
        </View>

        <DropdownField label="Country" icon="🌍" value={country} placeholder="Select country" onPress={() => openLocationPicker("country")} />
        <DropdownField label="State" icon="🗺️" value={state} placeholder={country ? "Select state" : "Select country first"} onPress={() => openLocationPicker("state")} />
        <DropdownField label="City" icon="🏙️" value={city} placeholder={state ? "Select city" : "Select state first"} onPress={() => openLocationPicker("city")} />

        <Field label="Full Address" icon="🏠" value={address} onChange={setAddress} placeholder="Door no., Street, Landmark..." multiline />
      </ScrollView>

      <View style={styles.updateWrap}>
        <TouchableOpacity
          style={[styles.updateBtn, saving && { opacity: 0.65 }]}
          onPress={handleUpdate}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Text style={styles.updateTxt}>{saving ? "Saving..." : "Update Profile"}</Text>
        </TouchableOpacity>
      </View>

      <AppDatePickerModal
        visible={dobPickerVisible}
        value={dob}
        onClose={() => setDobPickerVisible(false)}
        onChange={setDob}
      />

      <AppOptionPickerModal
        visible={activeLocationPicker === "country"}
        title="Select Country"
        options={countryOptions}
        selectedValue={country}
        onSelect={handleCountrySelect}
        onClose={() => setActiveLocationPicker(null)}
      />
      <AppOptionPickerModal
        visible={activeLocationPicker === "state"}
        title="Select State"
        options={stateOptions}
        selectedValue={state}
        onSelect={handleStateSelect}
        onClose={() => setActiveLocationPicker(null)}
      />
      <AppOptionPickerModal
        visible={activeLocationPicker === "city"}
        title="Select City"
        options={cityOptions}
        selectedValue={city}
        onSelect={setCity}
        onClose={() => setActiveLocationPicker(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 130 },

  topNav: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.darkCard, alignItems: "center", justifyContent: "center" },
  backArrow: { color: C.white, fontSize: 18, fontWeight: "700" },
  navTitle: { flex: 1, color: C.white, fontSize: 17, fontWeight: "700", textAlign: "center" },
  rightSpace: { width: 40 },

  sectionLbl: { marginTop: 20, marginBottom: 8 },
  sectionTitle: { color: C.gray, fontSize: 12, fontWeight: "600", marginBottom: 4 },
  sectionSub: { color: "#555", fontSize: 12, lineHeight: 18 },

  photoSection: { alignItems: "center", marginVertical: 18 },
  photoWrap: { position: "relative" },
  avatarBox: { width: 108, height: 108, borderRadius: 54, backgroundColor: C.avatarBg, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 2, borderColor: C.border },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitials: { color: C.white, fontSize: 30, fontWeight: "800" },
  avatarFallback: { fontSize: 42, color: C.white },
  cameraBtn: { position: "absolute", right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: "#2F6E8E", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.bg },
  cameraText: { fontSize: 14 },
  removeBtn: { position: "absolute", right: -2, top: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.bg },
  removeText: { color: C.white, fontSize: 14, fontWeight: "800", lineHeight: 16 },
  uploadLabel: { color: C.orange, fontSize: 14, fontWeight: "600", marginTop: 10, marginBottom: 4 },
  uploadHint: { color: "#555", fontSize: 11, textAlign: "center", lineHeight: 17, paddingHorizontal: 20 },

  fieldWrap: { marginBottom: 14 },
  fieldLabel: { color: C.gray, fontSize: 13, marginBottom: 7 },
  fieldBox: { flexDirection: "row", alignItems: "center", backgroundColor: C.darkCard, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, minHeight: 54 },
  fieldBoxMultiline: { minHeight: 96, alignItems: "flex-start", paddingTop: 12, paddingBottom: 12 },
  fieldIcon: { fontSize: 15, marginRight: 10, marginTop: Platform.OS === "ios" ? 0 : 1 },
  fieldInput: { flex: 1, color: C.white, fontSize: 14, paddingVertical: 0 },
  fieldInputMultiline: { textAlignVertical: "top", minHeight: 70 },
  placeholderText: { color: "#555" },
  dropdownArrow: { color: C.orange, fontSize: 16, marginLeft: 10 },

  addressSection: { marginTop: 24, marginBottom: 16, paddingTop: 20, borderTopWidth: 1, borderTopColor: C.border },
  addressTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
  addressSub: { color: C.gray, fontSize: 12, marginTop: 3 },

  updateWrap: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === "ios" ? 30 : 18, borderTopWidth: 1, borderTopColor: C.border },
  updateBtn: { backgroundColor: "#2F6E8E", borderRadius: 30, minHeight: 54, alignItems: "center", justifyContent: "center" },
  updateTxt: { color: C.white, fontSize: 16, fontWeight: "700" },
});