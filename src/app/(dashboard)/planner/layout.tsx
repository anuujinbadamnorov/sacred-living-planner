import PlannerLayout from '@/components/Layout'

export default function PlannerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PlannerLayout>{children}</PlannerLayout>
}
