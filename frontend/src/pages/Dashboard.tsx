import { StatCards } from '../components/StatCards'
import { BatteryGauge } from '../components/BatteryGauge'
import { ControlPanel } from '../components/ControlPanel'
import { SessionChart } from '../components/SessionChart'
import { SoundCard } from '../components/SoundCard'
import { ModeCard, SuctionCard, WaterCard } from '../components/CleaningCards'
import { ManualDrive } from '../components/ManualDrive'

export function Dashboard() {
  return (
    <div className="space-y-5">
      <StatCards />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4"><BatteryGauge /></div>
        <div className="lg:col-span-8"><ControlPanel /></div>
        <div className="lg:col-span-8"><SessionChart /></div>
        <div className="lg:col-span-4"><SoundCard /></div>
        <div className="lg:col-span-4"><ModeCard /></div>
        <div className="lg:col-span-4"><SuctionCard /></div>
        <div className="lg:col-span-4"><WaterCard /></div>
        <div className="lg:col-span-12"><ManualDrive /></div>
      </div>
    </div>
  )
}
