import { Power, Play, Pause, ChevronsRight, House, CircleStop, Megaphone, VolumeX } from 'lucide-react'
import { useApp } from '../app-context'
import { Card, CardHead, Button } from './ui'
import { useT } from '../i18n'

export function ControlPanel() {
  const { act } = useApp()
  const t = useT()
  return (
    <Card className="p-5 sm:p-6 h-full">
      <CardHead icon={Power} title={t('control.title')} desc={t('control.desc')} tone="#9d7bff" />

      <div className="grid grid-cols-3 gap-2.5">
        <Button variant="primary" icon={Play} onClick={() => act('start')}>{t('control.start')}</Button>
        <Button icon={Pause} onClick={() => act('pause')}>{t('control.pause')}</Button>
        <Button icon={ChevronsRight} onClick={() => act('resume')}>{t('control.resume')}</Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-2.5">
        <Button variant="cyan" icon={House} onClick={() => act('home')}>{t('control.dock')}</Button>
        <Button icon={CircleStop} onClick={() => act('break')}>{t('control.finish')}</Button>
      </div>

      <div className="mt-4 pt-4 border-t border-line/70 grid grid-cols-2 gap-2.5">
        <Button icon={Megaphone} onClick={() => act('locate_on')}>{t('control.locate')}</Button>
        <Button icon={VolumeX} onClick={() => act('locate_off')}>{t('control.quiet')}</Button>
      </div>
    </Card>
  )
}
