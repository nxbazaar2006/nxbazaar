export default function FormSkeleton() {
  return (
    <div className="w-full max-w-4xl p-4 border rounded-2xl mx-auto animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 bg-gray-200 rounded-2xl" />
        <div className="h-10 bg-gray-200 rounded-2xl" />
      </div>
      <div className="h-24 bg-gray-200 rounded-2xl" />
      <div className="h-10 bg-gray-200 rounded-2xl" />
    </div>
  );
}