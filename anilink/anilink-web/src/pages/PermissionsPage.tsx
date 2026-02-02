import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function PermissionsPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg space-y-4 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Enable permissions</h1>
          <p className="text-sm text-muted-foreground">
            AniLink needs a few permissions to personalize your experience.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Location access</p>
              <p className="text-xs text-muted-foreground">
                Find nearby vets and marketplace sellers.
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Camera access</p>
              <p className="text-xs text-muted-foreground">
                Capture animal symptoms for AI assessment.
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive updates on bookings and orders.
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
          </div>
        </div>
        <Button onClick={() => navigate('/home')} className="w-full">
          Continue to AniLink
        </Button>
      </Card>
    </div>
  )
}
