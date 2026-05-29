import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/lib/theme';
import { getPontoDoDia, registrarPonto, RegistroPonto } from '@/lib/ponto-store';
import { AuthUser } from '@/lib/auth';

interface Props {
  user: AuthUser;
}

function formatHora(tsMillis: number) {
  return new Date(tsMillis).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PontoCard({ user }: Props) {
  const [entrada, setEntrada] = useState<RegistroPonto | null>(null);
  const [saida, setSaida] = useState<RegistroPonto | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);

  async function carregar() {
    try {
      const { entrada: e, saida: s } = await getPontoDoDia({
        empresaId: user.empresaId,
        operadorLogin: user.login,
      });
      setEntrada(e);
      setSaida(s);
    } catch (err) {
      console.error('[PontoCard] erro ao carregar ponto', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function handleRegistrar(tipo: 'Entrada' | 'Saída') {
    const msg = tipo === 'Entrada'
      ? 'Registrar início do dia agora?'
      : 'Registrar fim do dia agora?';

    Alert.alert(
      tipo === 'Entrada' ? '▶ Iniciar dia' : '■ Finalizar dia',
      msg,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setRegistrando(true);
            try {
              const registro = await registrarPonto({
                empresaId: user.empresaId,
                operadorNome: user.nome,
                operadorLogin: user.login,
                tipo,
              });
              if (tipo === 'Entrada') setEntrada(registro);
              else setSaida(registro);
              Alert.alert(
                '✓ Registrado',
                `${tipo} registrada às ${formatHora(registro.tsMillis)}\n📍 ${registro.endereco}`,
              );
            } catch (err: any) {
              Alert.alert('Erro', err.message ?? 'Não foi possível registrar o ponto.');
            } finally {
              setRegistrando(false);
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={Colors.orange} />
      </View>
    );
  }

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit',
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="time-outline" size={18} color={Colors.orange} />
        <Text style={styles.headerTitle}>Ponto do dia</Text>
        <Text style={styles.headerDate}>{hoje}</Text>
      </View>

      {/* Registros */}
      <View style={styles.registros}>
        <View style={styles.registroItem}>
          <View style={[styles.dot, { backgroundColor: entrada ? Colors.green : Colors.cardBorder }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.registroLabel}>Entrada</Text>
            <Text style={[styles.registroHora, !entrada && { color: Colors.textDim }]}>
              {entrada ? formatHora(entrada.tsMillis) : '--:--'}
            </Text>
            {entrada && (
              <Text style={styles.registroEndereco} numberOfLines={1}>
                📍 {entrada.endereco}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divisor} />

        <View style={styles.registroItem}>
          <View style={[styles.dot, { backgroundColor: saida ? Colors.orange : Colors.cardBorder }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.registroLabel}>Saída</Text>
            <Text style={[styles.registroHora, !saida && { color: Colors.textDim }]}>
              {saida ? formatHora(saida.tsMillis) : '--:--'}
            </Text>
            {saida && (
              <Text style={styles.registroEndereco} numberOfLines={1}>
                📍 {saida.endereco}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Botão de ação */}
      {registrando ? (
        <View style={styles.btnLoading}>
          <ActivityIndicator color={Colors.white} size="small" />
          <Text style={styles.btnLoadingText}>Obtendo localização...</Text>
        </View>
      ) : !entrada ? (
        <TouchableOpacity style={styles.btnEntrada} onPress={() => handleRegistrar('Entrada')}>
          <Ionicons name="play-circle-outline" size={20} color={Colors.white} />
          <Text style={styles.btnText}>Iniciar dia</Text>
        </TouchableOpacity>
      ) : !saida ? (
        <TouchableOpacity style={styles.btnSaida} onPress={() => handleRegistrar('Saída')}>
          <Ionicons name="stop-circle-outline" size={20} color={Colors.white} />
          <Text style={styles.btnText}>Finalizar dia</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.concluidoRow}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
          <Text style={styles.concluidoText}>Jornada registrada</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  headerDate: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  registros: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  registroItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  registroLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  registroHora: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  registroEndereco: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divisor: {
    width: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 4,
  },
  btnEntrada: {
    backgroundColor: Colors.green,
    borderRadius: Radius.full,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSaida: {
    backgroundColor: Colors.orange,
    borderRadius: Radius.full,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  btnLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.cardBorder,
    borderRadius: Radius.full,
  },
  btnLoadingText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  concluidoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  concluidoText: {
    color: Colors.green,
    fontWeight: '600',
    fontSize: 14,
  },
});
