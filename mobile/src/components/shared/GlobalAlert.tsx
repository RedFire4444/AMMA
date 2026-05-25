import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAlertStore } from '../../store/alertStore';

// Monkey-patch Alert.alert globally to intercept native platform dialogs
Alert.alert = (alertTitle, alertMessage, alertButtons) => {
  useAlertStore.getState().showAlert(alertTitle, alertMessage || '', alertButtons);
};

export const GlobalAlert = () => {
  const { visible, title, message, buttons, hideAlert } = useAlertStore();

  if (!visible) return null;

  const renderButtons = () => {
    if (!buttons || buttons.length === 0) {
      return (
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={hideAlert}
          activeOpacity={0.7}
        >
          <Text style={styles.confirmButtonText}>OK</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={buttons.length > 2 ? styles.buttonColumn : styles.buttonRow}>
        {buttons.map((btn, index) => {
          const isCancel = btn.style === 'cancel';
          const isDestructive = btn.style === 'destructive';
          
          const buttonStyle = [
            styles.button,
            buttons.length > 2 ? styles.columnBtn : styles.flexBtn,
            isCancel ? styles.cancelButton : styles.confirmButton,
            isDestructive ? styles.destructiveButton : null,
          ];
          
          const textStyle = [
            isCancel ? styles.cancelButtonText : styles.confirmButtonText,
            isDestructive ? styles.destructiveButtonText : null,
          ];

          return (
            <TouchableOpacity
              key={index}
              style={buttonStyle}
              activeOpacity={0.7}
              onPress={() => {
                hideAlert();
                btn.onPress?.();
              }}
            >
              <Text style={textStyle}>{btn.text || 'Button'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={hideAlert}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {!!message && <Text style={styles.modalSubtitle}>{message}</Text>}
          {renderButtons()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.12)',
    elevation: 5,
    shadowColor: '#ED7624',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5C250E',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#87553E',
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  buttonColumn: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBtn: {
    flex: 1,
  },
  columnBtn: {
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'rgba(240, 127, 46, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(240, 127, 46, 0.2)',
  },
  cancelButtonText: {
    color: '#87553E',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#ED7624',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  destructiveButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  destructiveButtonText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
