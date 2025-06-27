export default function BreadcrumbSkeleton() {
  return (
    <div className="flex gap-2 h-7 items-center">
      <div className="flex gap-2">
        <div className="w-5 h-5 rounded-md bg-neutral-200 animate-pulse" />
        <div
          className="h-5 rounded-md bg-neutral-200 animate-pulse"
          style={{width: '52.61px'}}
        />
        <div>/</div>
        <div
          className="h-5 rounded-md bg-neutral-200 animate-pulse"
          style={{width: '53.61px'}}
        />
        <div>/</div>
        <div
          className="h-5 rounded-md bg-neutral-200 animate-pulse"
          style={{width: '179px'}}
        />
      </div>
    </div>
  );
}
