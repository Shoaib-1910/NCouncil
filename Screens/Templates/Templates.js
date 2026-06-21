import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import baseURL from '../Api';

const screenWidth = Dimensions.get('window').width;

// ─── Pre-defined templates ────────────────────────────────────────────────────
// Each field carries a `backendKey` — the exact column name expected by
// /Account/CreateAlert. Only fields present on the active template are sent;
// everything else is left out of the payload so those columns stay empty.
const TEMPLATES = [
  {
    id: 'fire',
    emoji: '🔥',
    label: 'Fire Incident',
    color: '#dc2626',
    lightColor: '#fef2f2',
    borderColor: '#fca5a5',
    fields: [
      { key: 'title',       backendKey: 'Tittle',           label: 'Alert Title',      defaultValue: 'Fire Incident Report',           placeholder: 'e.g. Fire Incident Report',           required: true,  multiline: false },
      { key: 'description', backendKey: 'Description',      label: 'Incident Details', defaultValue: 'A fire has been reported in the neighbourhood. Residents are advised to stay alert and evacuate if necessary.', placeholder: 'Describe the fire situation...', required: true, multiline: true },
      { key: 'targetedArea',backendKey: 'targetarea',       label: 'Targeted Area',    defaultValue: '',                                placeholder: 'e.g. Block C, Street 4, Near Main Gate', required: true,  multiline: false },
      { key: 'severity',    backendKey: 'severitylevel',    label: 'Severity Level',   defaultValue: 'High',                            placeholder: 'e.g. Low / Medium / High / Critical',   required: false, multiline: false },
      { key: 'instructions',backendKey: 'safetyinstruction',label: 'Safety Instructions', defaultValue: 'Call 1122 immediately. Do not use elevators. Evacuate using the nearest exit.', placeholder: 'Add safety steps...', required: false, multiline: true },
      { key: 'contact',     backendKey: 'emergencycontact', label: 'Emergency Contact', defaultValue: '1122',                           placeholder: 'Emergency helpline number',              required: false, multiline: false },
    ],
  },
  {
    id: 'missing',
    emoji: '🔍',
    label: 'Missing Person',
    color: '#7c3aed',
    lightColor: '#f5f3ff',
    borderColor: '#c4b5fd',
    fields: [
      { key: 'title',        backendKey: 'Tittle',        label: 'Alert Title',       defaultValue: 'Missing Person Alert',            placeholder: 'e.g. Missing Person Alert',              required: true,  multiline: false },
      { key: 'description',  backendKey: 'Description',   label: 'Person Description',defaultValue: 'A resident has been reported missing. Please share any information with the council immediately.', placeholder: 'Describe the missing person...', required: true, multiline: true },
      { key: 'targetedArea', backendKey: 'lastseenarea',  label: 'Last Seen Area',    defaultValue: '',                                placeholder: 'e.g. Park Area, Block B, Near Masjid',    required: true,  multiline: false },
      { key: 'personName',   backendKey: 'personname',    label: 'Person Name',       defaultValue: '',                                placeholder: 'Full name of missing person',             required: false, multiline: false },
      { key: 'age',          backendKey: 'age_gender',    label: 'Age / Gender',      defaultValue: '',                                placeholder: 'e.g. 8 years old, Male',                  required: false, multiline: false },
      { key: 'contact',      backendKey: 'contactperson', label: 'Contact Person',    defaultValue: '',                                placeholder: 'Family contact number',                   required: false, multiline: false },
    ],
  },
  {
    id: 'security',
    emoji: '🚨',
    label: 'Security Threat',
    color: '#b45309',
    lightColor: '#fffbeb',
    borderColor: '#fcd34d',
    fields: [
      { key: 'title',        backendKey: 'Tittle',             label: 'Alert Title',        defaultValue: 'Security Threat Alert',           placeholder: 'e.g. Security Threat Alert',              required: true,  multiline: false },
      { key: 'description',  backendKey: 'Description',        label: 'Threat Description', defaultValue: 'A security threat has been identified in the neighbourhood. Residents should remain indoors and report suspicious activity.', placeholder: 'Describe the threat...', required: true, multiline: true },
      { key: 'targetedArea', backendKey: 'targetarea',         label: 'Targeted Area',      defaultValue: '',                                placeholder: 'e.g. Main Entrance, Block A, Street 2',   required: true,  multiline: false },
      { key: 'threatType',   backendKey: 'threatype',          label: 'Threat Type',        defaultValue: '',                                placeholder: 'e.g. Suspicious vehicle / Unknown person', required: false, multiline: false },
      { key: 'instructions', backendKey: 'residentinstruction',label: 'Resident Instructions', defaultValue: 'Lock your doors and windows. Avoid going outside. Report any suspicious activity to 15 or the council guard.', placeholder: 'Safety instructions...', required: false, multiline: true },
      { key: 'contact',      backendKey: 'emergencycontact',   label: 'Emergency Contact',  defaultValue: '15',                              placeholder: 'Police / Security helpline',               required: false, multiline: false },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function TemplatesScreen({ route, navigation }) {
  const { councilId, memberId } = route.params ?? {};

  const [activeTemplate, setActiveTemplate] = useState(null); // template object
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const openTemplate = (tmpl) => {
    // Pre-fill defaults
    const defaults = {};
    tmpl.fields.forEach((f) => { defaults[f.key] = f.defaultValue; });
    setFormValues(defaults);
    setActiveTemplate(tmpl);
  };

  const closeTemplate = () => {
    setActiveTemplate(null);
    setFormValues({});
  };

  const handleSubmit = async () => {
    // Validate required fields
    for (const f of activeTemplate.fields) {
      if (f.required && !formValues[f.key]?.trim()) {
        Alert.alert('Required Field', `Please fill in "${f.label}".`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Build payload using ONLY the backend columns this template actually has.
      // Other templates' columns are never included, so the backend leaves them empty.
      const payload = {
        councilid: councilId,
      };

      activeTemplate.fields.forEach((f) => {
        payload[f.backendKey] = formValues[f.key] ?? '';
      });

      console.log('CreateAlert Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${baseURL}Account/CreateAlert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      console.log('CreateAlert Response:', data);

      if (response.ok) {
        Alert.alert('Alert Sent', `"${formValues['title']}" has been sent to all residents.`, [
          { text: 'OK', onPress: closeTemplate },
        ]);
      } else {
        Alert.alert('Error', data?.message || 'Failed to send alert.');
      }
    } catch (error) {
      console.error('Template submit error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Emergency Templates</Text>
        <Text style={styles.pageSubtitle}>Select a template to quickly send an alert</Text>
      </View>

      <ScrollView contentContainerStyle={styles.templateList} showsVerticalScrollIndicator={false}>
        {TEMPLATES.map((tmpl) => (
          <TouchableOpacity
            key={tmpl.id}
            style={[styles.templateCard, { borderColor: tmpl.borderColor, backgroundColor: tmpl.lightColor }]}
            onPress={() => openTemplate(tmpl)}
            activeOpacity={0.85}
          >
            <View style={[styles.templateIconCircle, { backgroundColor: tmpl.color }]}>
              <Text style={styles.templateEmoji}>{tmpl.emoji}</Text>
            </View>
            <View style={styles.templateCardContent}>
              <Text style={[styles.templateCardTitle, { color: tmpl.color }]}>{tmpl.label}</Text>
              <Text style={styles.templateCardHint}>
                {tmpl.fields.length} fields · Tap to customise & send
              </Text>
            </View>
            <Text style={[styles.templateArrow, { color: tmpl.color }]}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>ℹ️  About Templates</Text>
          <Text style={styles.noteText}>
            Templates are pre-filled emergency alerts for common neighbourhood situations.
            You can edit every field before sending. All alerts are broadcast to council members instantly.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Template Form Modal ── */}
      {activeTemplate && (
        <Modal visible animationType="slide" transparent onRequestClose={closeTemplate}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.formSheet}>
              {/* Top accent */}
              <View style={[styles.formTopBar, { backgroundColor: activeTemplate.color }]} />

              {/* Form header */}
              <View style={[styles.formHeader, { backgroundColor: activeTemplate.lightColor, borderBottomColor: activeTemplate.borderColor }]}>
                <View style={styles.formHeaderLeft}>
                  <Text style={styles.formHeaderEmoji}>{activeTemplate.emoji}</Text>
                  <Text style={[styles.formHeaderTitle, { color: activeTemplate.color }]}>{activeTemplate.label}</Text>
                </View>
                <TouchableOpacity onPress={closeTemplate} style={styles.formCloseBtn}>
                  <Text style={styles.formCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Fields */}
              <ScrollView
                contentContainerStyle={styles.formBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {activeTemplate.fields.map((field) => (
                  <View key={field.key} style={styles.fieldBlock}>
                    <Text style={[styles.fieldLabel, { color: activeTemplate.color }]}>
                      {field.label}
                      {field.required && <Text style={styles.fieldRequired}> *</Text>}
                    </Text>
                    <TextInput
                      style={[
                        styles.fieldInput,
                        field.multiline && styles.fieldInputMulti,
                        { borderColor: activeTemplate.borderColor },
                        field.key === 'targetedArea' && styles.fieldInputHighlight,
                      ]}
                      placeholder={field.placeholder}
                      placeholderTextColor="#bbb"
                      value={formValues[field.key] ?? ''}
                      onChangeText={(val) => setFormValues((prev) => ({ ...prev, [field.key]: val }))}
                      multiline={field.multiline}
                      numberOfLines={field.multiline ? 3 : 1}
                      textAlignVertical={field.multiline ? 'top' : 'center'}
                    />
                    {field.key === 'targetedArea' && (
                      <Text style={styles.fieldHint}>📍 Specify the exact area this alert applies to</Text>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Action buttons */}
              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeTemplate} disabled={submitting}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendBtn, { backgroundColor: activeTemplate.color }, submitting && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.sendBtnText}>🚨 Send Alert</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },

  // ── Page header ──
  pageHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { marginBottom: 10 },
  backBtnText: { fontSize: 15, color: '#c47f2e', fontWeight: '600' },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  pageSubtitle: { fontSize: 13, color: '#888', marginTop: 4 },

  // ── Template list ──
  templateList: { paddingHorizontal: 20, paddingTop: 24 },
  templateCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 18,
    padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  templateIconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  templateEmoji: { fontSize: 26 },
  templateCardContent: { flex: 1 },
  templateCardTitle: { fontSize: 17, fontWeight: '800', marginBottom: 3 },
  templateCardHint: { fontSize: 12, color: '#999' },
  templateArrow: { fontSize: 26, fontWeight: '300', marginLeft: 6 },

  // ── Info note ──
  noteBox: { backgroundColor: '#f0f9ff', borderRadius: 14, padding: 16, marginTop: 4, borderWidth: 1, borderColor: '#bae6fd' },
  noteTitle: { fontSize: 14, fontWeight: '700', color: '#0369a1', marginBottom: 6 },
  noteText: { fontSize: 13, color: '#0c4a6e', lineHeight: 20 },

  // ── Form modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  formSheet: { backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden', maxHeight: '93%' },
  formTopBar: { height: 5, width: '100%' },
  formHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  formHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  formHeaderEmoji: { fontSize: 22, marginRight: 10 },
  formHeaderTitle: { fontSize: 17, fontWeight: '800' },
  formCloseBtn: { padding: 6 },
  formCloseBtnText: { fontSize: 17, color: '#555', fontWeight: '700' },

  // ── Fields ──
  formBody: { padding: 20, paddingBottom: 8 },
  fieldBlock: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  fieldRequired: { color: '#dc2626' },
  fieldInput: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#222', backgroundColor: '#fafafa',
  },
  fieldInputMulti: { height: 88, textAlignVertical: 'top', paddingTop: 10 },
  fieldInputHighlight: { backgroundColor: '#fff7ed', borderWidth: 2 },
  fieldHint: { fontSize: 11, color: '#888', marginTop: 4 },

  // ── Action buttons ──
  formActions: { flexDirection: 'row', padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: '#ccc', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontWeight: '600', fontSize: 15 },
  sendBtn: { flex: 2, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  sendBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});