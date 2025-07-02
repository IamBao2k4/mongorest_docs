import { buttonVariants } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Link } from '@/components/ui/Link';
import { User } from 'lucide-react';

function TabGroupFields({ formData, showBuilder, setShowBuilder }) {
  return (
    <div className='flex justify-between items-center pb-4'>
      <Tabs
        value={showBuilder}
        onValueChange={(val) => {
          setShowBuilder(val);
        }}>
        <TabsList className='w-full'>
          {listTabs?.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className='flex gap-2'>
        {formData?.mongodb_collection_name ? (
          <Link
            className={buttonVariants({ variant: 'outline' })}
            href={`/${formData?.mongodb_collection_name}`}>
            View Table
          </Link>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

const listTabs = [
  {
    label: 'Information Entity',
    value: 'init',
    icon: <User />,
  },
  {
    label: 'Form Builder',
    value: 'json-builder',
    icon: <User />,
  },
  {
    label: 'Form Builder v2',
    value: 'json-builder-v2',
    icon: <User />,
  },
  {
    label: 'Preview Form',
    value: 'preview-form',
    icon: <User />,
  },
  {
    label: 'View JSON',
    value: 'view-json',
    icon: <User />,
  },
  {
    label: 'Setting',
    value: 'setting',
    icon: <User />,
  },
];

export default TabGroupFields;
