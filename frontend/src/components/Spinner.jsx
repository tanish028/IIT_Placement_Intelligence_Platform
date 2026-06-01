export default function Spinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F59E0B', borderTopColor: 'transparent' }} />
    </div>
  )
}
