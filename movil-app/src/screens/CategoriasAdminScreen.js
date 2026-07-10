import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function CategoriasAdminScreen() {
  const navigation = useNavigation();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [saving, setSaving] = useState(false);

  const cargar = async () => {
    try {
      const r = await getCategorias();
      setCats(r.data || []);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudieron cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const limpiar = () => { setEditId(null); setNombre(''); setIcono(''); setColor('#3b82f6'); };

  const editar = (c) => { setEditId(c.id); setNombre(c.nombre); setIcono(c.icono); setColor(c.color); };

  const guardar = async () => {
    if (!nombre.trim() || !icono.trim()) return Alert.alert('Error', 'Nombre e icono son obligatorios');
    setSaving(true);
    try {
      if (editId) await actualizarCategoria(editId, { nombre: nombre.trim(), icono: icono.trim(), color });
      else await crearCategoria(nombre.trim(), icono.trim(), color);
      limpiar();
      await cargar();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const borrar = (c) => {
    Alert.alert('Eliminar', `¿Eliminar "${c.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await eliminarCategoria(c.id);
            if (editId === c.id) limpiar();
            await cargar();
          } catch (e) {
            Alert.alert('Error', e.message || 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={22} color="#f1f5f9" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Categorías</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>{editId ? 'Editar categoría' : 'Nueva categoría'}</Text>
        <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#475569" value={nombre} onChangeText={setNombre} />
        <TextInput style={styles.input} placeholder="Icono (ej: car, trash, bulb)" placeholderTextColor="#475569" value={icono} onChangeText={setIcono} autoCapitalize="none" />
        <View style={styles.colorRow}>
          <Text style={[styles.label, { flex: 1 }]}>Color</Text>
          <TextInput style={[styles.input, styles.colorInput]} placeholder="#3b82f6" placeholderTextColor="#475569" value={color} onChangeText={setColor} autoCapitalize="none" />
          <View style={[styles.colorPreview, { backgroundColor: color || '#3b82f6' }]} />
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={guardar} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{editId ? 'Actualizar' : 'Agregar'}</Text>}
        </TouchableOpacity>
        {editId != null && (
          <TouchableOpacity style={styles.cancelBtn} onPress={limpiar}>
            <Text style={styles.cancelText}>Cancelar edición</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <FlatList
        style={styles.list}
        data={cats}
        keyExtractor={(c) => String(c.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={[styles.itemIcon, { backgroundColor: (item.color || '#64748b') + '20' }]}>
              <Ionicons name={item.icono} size={18} color={item.color || '#64748b'} />
            </View>
            <Text style={styles.itemName}>{item.nombre}</Text>
            <TouchableOpacity onPress={() => editar(item)}><Ionicons name="create-outline" size={20} color="#3b82f6" /></TouchableOpacity>
            <TouchableOpacity onPress={() => borrar(item)}><Ionicons name="trash-outline" size={20} color="#ef4444" /></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { color: '#f1f5f9', fontSize: 17, fontWeight: '700' },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  form: { padding: 20, paddingBottom: 8 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: '#1e293b', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: '#f1f5f9', fontSize: 15, marginBottom: 12 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  colorInput: { flex: 1, marginBottom: 0 },
  colorPreview: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#1e293b' },
  saveBtn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  list: { flex: 1, paddingHorizontal: 16 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 12, borderRadius: 14, marginBottom: 8, gap: 10 },
  itemIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  itemName: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', flex: 1 },
});
