import { Sparkles, Wind, Droplets } from 'lucide-react'
import { useApp } from '../app-context'
import { MODES, SUCTION, WATER, TONES, type Option, type IconType } from '../lib/meta'
import { Card, CardHead, Segmented } from './ui'
import { useT } from '../i18n'

function SettingCard({
  icon, title, desc, tone, options, value, onChange,
}: {
  icon: IconType
  title: string
  desc: string
  tone: string
  options: Option[]
  value: string | null | undefined
  onChange: (v: string) => void
}) {
  return (
    <Card className="p-5 h-full">
      <CardHead icon={icon} title={title} desc={desc} tone={tone} />
      <Segmented options={options} value={value} onChange={onChange} />
    </Card>
  )
}

export function ModeCard() {
  const { status, act } = useApp()
  const t = useT()
  return (
    <SettingCard
      icon={Sparkles} title={t('card.mode.title')} desc={t('card.mode.desc')} tone={TONES.violet}
      options={MODES} value={status?.mode} onChange={(v) => act('mode', v)}
    />
  )
}

export function SuctionCard() {
  const { status, act } = useApp()
  const t = useT()
  return (
    <SettingCard
      icon={Wind} title={t('card.suction.title')} desc={t('card.suction.desc')} tone={TONES.cyan}
      options={SUCTION} value={status?.suction} onChange={(v) => act('suction', v)}
    />
  )
}

export function WaterCard() {
  const { status, act } = useApp()
  const t = useT()
  return (
    <SettingCard
      icon={Droplets} title={t('card.water.title')} desc={t('card.water.desc')} tone={TONES.green}
      options={WATER} value={status?.cistern} onChange={(v) => act('water', v)}
    />
  )
}
