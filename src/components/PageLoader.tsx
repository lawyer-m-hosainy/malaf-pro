import LoadingSpinner from './LoadingSpinner';

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full h-full">
      <LoadingSpinner size="lg" text="جاري التحميل..." />
    </div>
  );
}
