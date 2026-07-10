import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const ROLES = ['ciudadano', 'funcionario', 'admin'];

export default function UsuariosAdminScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('ciudadano');
  const [saving, setSaving] = useState(false);

  const cargar = async () => {
    try {
      const r = await getUsuarios();
      setUsers(r || []);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const limpiar = () => { setEditId(null); setName(''); setEmail(''); setTelefono(''); setPassword(''); setRol('ciudadano'); };

  const editar = (u) => { setEditId(u.id); setName(u.name); setEmail(u.email); setTelefono(u.telefono || ''); setPassword(''); setRol(u.rol); };

  const guardar = async () => {
    if (!name.trim() || !email.trim()) return Alert.alert('Error', 'Nombre y correo son obligatorios');
    if (!editId && !password) return Alert.alert('Error', 'La contraseña es obligatoria al crear');
    setSaving(true);
    try {
      const datos = { name: name.trim(), email: email.trim(), telefono: telefono.trim(), rol };
      if (password) datos.password = password;
      if (editId) await actualizarUsuario(editId, datos);
      else await crearUsuario(datos);
      limpiar();
      await cargar();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const borrar = (u) => {
    Alert.alert('Eliminar', `¿Eliminar a "${u.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await eliminarUsuario(u.id);
            if (editId === u.id) limpiar();
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
        <Text style={styles.headerTitle}>Usuarios</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>{editId ? 'Editar usuario' : 'Nuevo usuario'}</Text>
        <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#475569" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Correo" placeholderTextColor="#475569" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Teléfono (opcional)" placeholderTextColor="#475569" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder={editId ? 'Contraseña (dejar vacía para no cambiar)' : 'Contraseña'} placeholderTextColor="#475569" value={password} onChangeText={setPassword} secureTextEntry />
        <Text style={styles.label}>Rol</Text>
        <View style={styles.rolRow}>
          {ROLES.map((r) => (
            <TouchableOpacity key={r} style={[styles.rolBtn, rol === r && styles.rolBtnActive]} onPress={() => setRol(r)}>
              <Text style={[styles.rolText, rol === r && { color: '#fff' }]}>{r}</Text>
            </TouchableOpacity>
          ))}
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
        data={users}
        keyExtractor={(u) => String(u.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemEmail}>{item.email}</Text>
              <View style={[styles.rolTag, { backgroundColor: item.rol === 'admin' ? '#8b5cf6' : item.rol === 'funcionario' ? '#3b82f6' : '#475569' }]}>
                <Text style={styles.rolTagText}>{item.rol}</Text>
              </View>
            </View>
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
  rolRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  rolBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#1e293b' },
  rolBtnActive: { backgroundColor: '#3b82f6' },
  rolText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  saveBtn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  list: { flex: 1, paddingHorizontal: 16 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 12, borderRadius: 14, marginBottom: 8, gap: 10 },
  itemName: { color: '#f1f5f9', fontSize: 15, fontWeight: '600' },
  itemEmail: { color: '#64748b', fontSize: 12, marginTop: 2 },
  rolTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 6 },
  rolTagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
