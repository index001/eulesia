import { Capacitor } from '@capacitor/core'

export async function initCapacitor() {
  if (!Capacitor.isNativePlatform()) return

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })

    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#1e3a8a' })
    }
  } catch (e) {
    console.warn('StatusBar plugin error:', e)
  }
}
