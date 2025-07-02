import {HolderOutlined} from '@ant-design/icons';

export default function TreeSkeleton() {
  return (
    <div className="w-full h-full">
      {new Array(5).fill().map((_, index) => (
        <div key={index} className="flex gap-6 items-center h-8 pb-1">
          <div className="w-6 h-6 flex items-center justify-center">
            <HolderOutlined
              style={{
                fill: 'rgba(0, 0, 0, 0.88)',
                color: 'rgba(0, 0, 0, 0.88)',
                opacity: '0.2',
              }}
            />
          </div>
          <div className="rounded-md px-1 h-4 w-full bg-neutral-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
