import { CheckSquare } from 'lucide-react'
import PackingChecklist from './PackingChecklist'
import AnimalPageHero from './AnimalPageHero'

export default function PackingPage() {
  return (
    <div className="min-h-screen bg-trip-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimalPageHero
          role="squirrel"
          eyebrow="打包松鼠 · 收纳值班"
          title="把该带的，一件件收进箱子"
          subtitle="根据旅行类型整理清单，勾完就能安心出发。"
        />

        <div className="mt-6">
          <PackingChecklist />
        </div>
      </div>
    </div>
  )
}
