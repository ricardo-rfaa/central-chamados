import { StyleSheet } from 'react-native'
import { colors } from './colors'

// Equivalente ao inputStyle/btnStyle de src/lib/styles.ts na versão web.
// StyleSheet.create em vez de objeto inline — é o padrão do React Native,
// e permite ao RN otimizar os estilos internamente.
export const sharedStyles = StyleSheet.create({
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    color: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonPrimaryText: {
    color: colors.accentText,
    fontWeight: '600',
    fontSize: 14,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  errorBox: {
    marginTop: 14,
    padding: 10,
    borderRadius: 4,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 12.5,
  },
})
