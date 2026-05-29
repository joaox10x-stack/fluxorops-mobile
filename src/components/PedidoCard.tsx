import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/lib/theme';
import { Pedido, atualizarStatusPedido, salvarObservacao } from '@/lib/pedidos-store';
import { AuthUser } from '@/lib/auth';

interface Props {
  pedido: Pedido;
  user: AuthUser;
  onAtualizado: () => void;
}

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', bg: '#2d2a1a', text: Colors.yellow },
  em_rota: { label: 'Em rota', bg: '#1a2233', text: Colors.blue },
  concluido: { label: 'Concluído', bg: '#0f2318', text: Colors.green },
};

export function PedidoCard({ pedido, user, onAtualizado }: Props) {
  const [obsModal, setObsModal] = useState(false);
  const [obsText, setObsText] = useState(pedido.observacao ?? '');
  const [salvandoObs, setSalvandoObs] = useState(false);

  const cfg = STATUS_CONFIG[pedido.status];

  function abrirRota() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pedido.endereco)}`;
    Linking.openURL(url);
  }

  function abrirWhatsApp() {
    const tel = pedido.whatsapp?.replace(/\D/g, '');
    if (!tel) { Alert.alert('Atenção', 'WhatsApp não cadastrado.'); return; }
    Linking.openURL(`https://wa.me/55${tel}`);
  }

  function confirmarFinalizar() {
    Alert.alert(
      'Finalizar pedido',
      `Confirmar conclusão para ${pedido.cliente}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            try {
              await atualizarStatusPedido({
                empresaId: user.empresaId,
                pedidoId: pedido.id,
                status: 'concluido',
                montadorLogin: user.login,
                montadorNome: user.nome,
              });
              onAtualizado();
            } catch {
              Alert.alert('Erro', 'Não foi possível finalizar.');
            }
          },
        },
      ],
    );
  }

  async function salvarObs() {
    setSalvandoObs(true);
    try {
      await salvarObservacao({ empresaId: user.empresaId, pedidoId: pedido.id, observacao: obsText });
      setObsModal(false);
      onAtualizado();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar observação.');
    } finally {
      setSalvandoObs(false);
    }
  }

  return (
    <>
      <View style={styles.card}>
        {/* Topo */}
        <View style={styles.topoRow}>
          <Text style={styles.cliente} numberOfLines={1}>{pedido.cliente}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={styles.nf}>NF {pedido.nf}</Text>

        <View style={styles.divider} />

        {/* Infos */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={Colors.orange} />
          <Text style={styles.infoText} numberOfLines={2}>{pedido.endereco}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={14} color={Colors.orange} />
          <Text style={styles.infoText} numberOfLines={1}>{pedido.montador}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={14} color={Colors.orange} />
          <Text style={styles.infoText} numberOfLines={2}>{pedido.itens}</Text>
        </View>

        {pedido.status === 'concluido' && pedido.concluidoEm ? (
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={14} color={Colors.green} />
            <Text style={[styles.infoText, { color: Colors.green }]}>
              Concluído em {new Date(pedido.concluidoEm).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
              })} por {pedido.concluidoPor}
            </Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        {/* Ações */}
        <View style={styles.acoesRow}>
          <TouchableOpacity style={styles.btnAcao} onPress={abrirRota}>
            <Ionicons name="navigate-outline" size={16} color={Colors.text} />
            <Text style={styles.btnAcaoText}>Rota</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAcao} onPress={abrirWhatsApp}>
            <Ionicons name="logo-whatsapp" size={16} color={Colors.text} />
            <Text style={styles.btnAcaoText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAcao} onPress={() => setObsModal(true)}>
            <Ionicons name="create-outline" size={16} color={Colors.text} />
            <Text style={styles.btnAcaoText}>Obs</Text>
          </TouchableOpacity>
        </View>

        {pedido.status !== 'concluido' && (
          <TouchableOpacity style={styles.btnFinalizar} onPress={confirmarFinalizar}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
            <Text style={styles.btnFinalizarText}>Finalizar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal Observação */}
      <Modal visible={obsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Observação</Text>
            <TextInput
              style={styles.modalInput}
              value={obsText}
              onChangeText={setObsText}
              multiline
              numberOfLines={4}
              placeholder="Digite aqui..."
              placeholderTextColor={Colors.textDim}
              textAlignVertical="top"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setObsModal(false)}>
                <Text style={styles.modalBtnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnSalvar, salvandoObs && { opacity: 0.7 }]}
                onPress={salvarObs}
                disabled={salvandoObs}
              >
                <Text style={styles.modalBtnSalvarText}>
                  {salvandoObs ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  topoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cliente: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  nf: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  acoesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  btnAcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: '#252836',
  },
  btnAcaoText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  btnFinalizar: {
    backgroundColor: Colors.orange,
    borderRadius: Radius.full,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnFinalizarText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  modalInput: {
    backgroundColor: '#252836',
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 100,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalBtnCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  modalBtnCancelarText: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  modalBtnSalvar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.orange,
    alignItems: 'center',
  },
  modalBtnSalvarText: {
    color: Colors.white,
    fontWeight: '700',
  },
});
