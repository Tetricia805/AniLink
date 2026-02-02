import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SettingsPage() {
  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Update your preferences.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">District</label>
          <Input placeholder="Kampala" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <Input placeholder="+256700000000" />
        </div>
      </div>
      <Button>Save settings</Button>
    </Card>
  )
}
