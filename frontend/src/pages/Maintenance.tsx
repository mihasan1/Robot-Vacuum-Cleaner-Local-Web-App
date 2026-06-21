import { Eraser } from 'lucide-react'
import { useApp } from '../app-context'
import { Card, CardHead, Button } from '../components/ui'
import { MaintenanceList } from '../components/MaintenanceList'
import { MaintenanceRadial } from '../components/MaintenanceRadial'
import { useT } from '../i18n'

export function Maintenance() {
  const { act } = useApp()
  const t = useT()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-7 space-y-5">
        <MaintenanceList />
        <Card className="p-5 sm:p-6">
          <CardHead icon={Eraser} title={t('maint.mapTitle')} desc={t('maint.mapDesc')} tone="#f87171" />
          <Button
            variant="danger" icon={Eraser}
            onClick={() => { if (confirm(t('maint.mapConfirm'))) act('reset_map', undefined, 'maint.mapDone') }}
          >
            {t('maint.mapReset')}
          </Button>
        </Card>
      </div>
      <div className="lg:col-span-5">
        <MaintenanceRadial />
      </div>
    </div>
  )
}
