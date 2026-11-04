import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold text-foreground">Moldy Market Admin.</h1>
      <p className="mt-2 text-muted-foreground">Mua bán đồ cũ ưng ý, an tâm giao dịch.</p>
      <div className="mt-6 rounded-xl bg-muted p-6">
        <p className="text-foreground">Khối surface (#F3F4F6) với chữ chính (#252525)</p>
        <Button className="mt-4">Mua ngay</Button>
      </div>
    </div>
  )
}

export default App
