import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, Radius } from '@/lib/theme';
import { PontoCard } from '@/components/PontoCard';
import { PedidoCard } from '@/components/PedidoCard';
import { OfflineBanner } from '@/components/OfflineBanner';
import { getPedidosDoDia, getHistoricoPedidos, Pedido } from '@/lib/pedidos-store';
import { useRouter } from 'expo-router';

type Aba = 'pedidos' | 'historico';

export default function MontadorHome() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('pedidos');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [historico, setHistorico] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    if (!user) return;
    try {
      const [p, h] = await Promise.all([
        getPedidosDoDia({ empresaId: user.empresaId, montadorLogin: user.login }),
        getHistoricoPedidos({ empresaId: user.empresaId, montadorLogin: user.login }),
      ]);
      setPedidos(p);
      setHistorico(h);
    } catch (err) {
      console.error('[MontadorHome] erro:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { carregar(); }, [carregar]);

  function onRefresh() {
    setRefreshing(true);
    carregar();
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/login');
      }},
    ]);
  }

  const lista = aba === 'pedidos' ? pedidos : historico;
  const pendentes = pedidos.filter((p) => p.status === 'pendente').length;
  const concluidos = pedidos.filter((p) => p.status === 'concluido').length;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Banner offline — aparece logo abaixo da SafeArea */}
      <OfflineBanner />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Olá, {user?.nome?.split(' ')[0]} 👋</Text>
          <Text style={styles.headerTitle}>FluxorOps</Text>
          <Text style={styles.headerEmpresa}>Montador | {user?.empresaId}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{pedidos.length}</Text>
          <Text style={styles.statLabel}>Hoje</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: Colors.green }]}>{concluidos}</Text>
          <Text style={styles.statLabel}>Concluídos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: Colors.yellow }]}>{pendentes}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
      </View>

      {/* Abas */}
      <View style={styles.abas}>
        <TouchableOpacity
          style={[styles.abaBtn, aba === 'pedidos' && styles.abaBtnAtiva]}
          onPress={() => setAba('pedidos')}
        >
          <Text style={[styles.abaText, aba === 'pedidos' && styles.abaTextAtivo]}>
            Pedidos do dia
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.abaBtn, aba === 'historico' && styles.abaBtnAtiva]}
          onPress={() => setAba('historico')}
        >
          <Text style={[styles.abaText, aba === 'historico' && styles.abaTextAtivo]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.orange} size="large" />
        </View>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.orange} />}
          ListHeaderComponent={
            aba === 'pedidos' && user ? <PontoCard user={user} /> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="checkmark-circle-outline" size={48} color={Colors.textDim} />
              <Text style={styles.emptyText}>
                {aba === 'pedidos' ? 'Nenhum pedido para hoje' : 'Nenhum histórico'}
              </Text>
            </View>
          }
          renderItem={({ item }) =>
            user ? (
              <PedidoCard pedido={item} user={user} onAtualizado={carregar} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerSub: { fontSize: 12, color: Colors.textMuted },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  headerEmpresa: { fontSize: 11, color: Colors.orange, marginTop: 1 },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.cardBorder, marginHorizontal: 4 },
  abas: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  abaBtn: {
    flex: 1, paddingVertical: 9, borderRadius: Radius.full,
    alignItems: 'center', backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  abaBtnAtiva: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  abaText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  abaTextAtivo: { color: Colors.white },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: 32 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textDim },
});
