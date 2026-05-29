import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/lib/theme';
import { Entrega, EntregaStatus, STATUS_LABEL, atualizarStatusEntrega, salvarObservacaoEntrega } from '@/lib/entregas-store';
import { AuthUser } from '@/lib/auth';

interface Props {
  entrega: Entrega;
  user: AuthUser;
  onAtualizado: () => void;
}

const STATUS_CONFIG: Record<EntregaStatus, { bg: string; text: string }> = {
  pendente:   { bg: '#2d2a1a', text: Colors.yellow },
  coletado:   { bg: '#1a1f33', text: '#a78bfa' },
  transporte: { bg: '#1a2233', text: Colors.blue },
  entregue:   { bg: '#0f2318', text: Colors.green },
  problema:   { bg: '#2d1a1a', text: Colors.red },
};

export function EntregaCard({ entrega, user, onAtualizado }: Props) {
  const [obsModal, setObsModal] = useState(false);
  const [obsText, setObsText] = useState(entrega.observacao ?? '');
  const [salvandoObs, setSalvandoObs] = useState(false);

  const cfg = STATUS_CONFIG[entrega.status];

  function abrirRota() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(entrega.endereco)}`;
    Linking.openURL(url);
  }

  function avancarStatus() {
    const FLUXO: EntregaStatus[] = ['pendente', 'coletado', 'transporte', 'entregue'];
    const idx = FLUXO.indexOf(entrega.status);
    if (idx < 0 || idx >= FLUXO.length - 1) return;
    const proximo = FLUXO[idx + 1];
    Alert.alert(
      'Atualizar status',
      `Mudar para "${STATUS_LABEL[proximo]}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await atualizarStatusEntrega({ empresaId: user.empresaId, entregaId: entrega.id, status: proximo });
              onAtualizado();
            } catch {
              Alert.alert('Erro', 'Não foi possível atualizar.');
            }
          },
        },
      ],
    );
  }

  async function salvarObs() {
    setSalvandoObs(true);
    try {
      await salvarObservacaoEntrega({ empresaId: user.empresaId, entregaId: entrega.id, observacao: obsText });
      setObsModal(false);
      onAtualizado();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSalvandoObs(false);
    }
  }

  const FLUXO: EntregaStatus[] = ['pendente', 'coletado', 'transporte', 'entregue'];
  const podeAvancar = FLUXO.indexOf(entrega.status) < FLUXO.length - 1;

  return (
    <>
      <View style={styles.card}>
        <View style={styles.topoRow}>
          <Text style={styles.cliente} numberOfLines={1}>{entrega.cliente}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.badgeText, { color: cfg.text }]}>{STATUS_LABEL[entrega.status]}</Text>
          </View>
        </View>
        <Text style={styles.nota}>NF {entrega.numeroNota}</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={Colors.orange} />
          <Text style={styles.infoText} numberOfLines={2}>{entrega.endereco}</Text>
        </View>
        {entrega.produtos?.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={14} color={Colors.orange} />
            <Text style={styles.infoText} numberOfLines={2}>{entrega.produtos.join(', ')}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.acoesRow}>
          <TouchableOpacity style={styles.btnAcao} onPress={abrirRota}>
            <Ionicons name="navigate-outline" size={16} color={Colors.text} />
            <Text style={styles.btnAcaoText}>Rota</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAcao} onPress={() => setObsModal(true)}>
            <Ionicons name="create-outline" size={16} color={Colors.text} />
            <Text style={styles.btnAcaoText}>Obs</Text>
          </TouchableOpacity>
        </View>

        {podeAvancar && (
          <TouchableOpacity style={styles.btnFinalizar} onPress={avancarStatus}>
            <Ionicons name="arrow-forward-circle-outline" size={18} color={Colors.white} />
            <Text style={styles.btnFinalizarText}>
              {entrega.status === 'pendente' ? 'Coletar' :
               entrega.status === 'coletado' ? 'Em transporte' :
               entrega.status === 'transporte' ? 'Finalizar entrega' : 'Avançar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
                <Text style={styles.modalBtnSalvarText}>{salvandoObs ? 'Salvando...' : 'Salvar'}</Text>
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
  topoRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  cliente: { fontSize: 16, fontWeight: '700', color: Colors.text, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: 11, fontWeight: '700' },
  nota: { fontSize: 12, color: Colors.textMuted, marginTop: 2, marginBottom: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: Spacing.sm },
  infoRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginBottom: 6 },
  infoText: { fontSize: 13, color: Colors.textMuted, flex: 1, lineHeight: 18 },
  acoesRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  btnAcao: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 1,
    borderColor: Colors.cardBorder, backgroundColor: '#252836',
  },
  btnAcaoText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  btnFinalizar: {
    backgroundColor: Colors.orange, borderRadius: Radius.full, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnFinalizarText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.card, borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.md,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  modalInput: {
    backgroundColor: '#252836', borderRadius: Radius.md, padding: Spacing.md,
    color: Colors.text, fontSize: 14, borderWidth: 1, borderColor: Colors.cardBorder, minHeight: 100,
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm },
  modalBtnCancelar: {
    flex: 1, paddingVertical: 12, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center',
  },
  modalBtnCancelarText: { color: Colors.textMuted, fontWeight: '600' },
  modalBtnSalvar: { flex: 1, paddingVertical: 12, borderRadius: Radius.full, backgroundColor: Colors.orange, alignItems: 'center' },
  modalBtnSalvarText: { color: Colors.white, fontWeight: '700' },
});
