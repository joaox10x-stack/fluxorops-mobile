import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authenticate } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, Radius } from '@/lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [empresa, setEmpresa] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!empresa.trim() || !usuario.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      const user = await authenticate(empresa.trim(), usuario.trim(), senha);
      await login(user);
      if (user.tipo === 'montador') router.replace('/(montador)/home');
      else if (user.tipo === 'entregador') router.replace('/(entregador)/home');
      else router.replace('/(montador)/home');
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Falha no login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoBox}>
            <Ionicons name="cube-outline" size={40} color={Colors.white} />
          </View>
          <Text style={styles.logoTitle}>FluxorOps</Text>
          <Text style={styles.logoSub}>Montagens & Entregas</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Empresa</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Perin"
              placeholderTextColor={Colors.textDim}
              value={empresa}
              onChangeText={setEmpresa}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu login"
              placeholderTextColor={Colors.textDim}
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.senhaRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor={Colors.textDim}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showSenha}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowSenha((v) => !v)}
              >
                <Ionicons
                  name={showSenha ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btnLogin, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.btnLoginText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    backgroundColor: Colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#252836',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  senhaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeBtn: {
    padding: 10,
  },
  btnLogin: {
    backgroundColor: Colors.orange,
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  btnLoginText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
