import { create } from 'zustand';
import { AlertButton } from 'react-native';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: '',
  buttons: [],
  showAlert: (title: string, message: string, buttons = []) => {
    set({ visible: true, title, message, buttons });
  },
  hideAlert: () => {
    set({ visible: false, title: '', message: '', buttons: [] });
  },
}));
