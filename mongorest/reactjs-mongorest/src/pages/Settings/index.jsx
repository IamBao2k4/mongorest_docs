'use client';

import { Button } from '@/components/ui/Button';
import { Tree } from '@/components/ui/Tree';
import { useAuth } from '@/context/AuthContext';
import { entityDataApi } from '@/services';
import { Loader } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const hasKey = (data, targetKey) => {
  return data.some(
    (item) => item.key === targetKey || (item.children && hasKey(item.children, targetKey))
  );
};

export function PageSettings() {
  const { jsonSchema, tenant, setTenant, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [selectedSidebar, setSelectedSidebar] = useState(null);

  const dataSidebar = useMemo(() => {
    const _data = dataDefault;
    _data.splice(1, 0, {
      title: 'Posttype',
      key: 'posttype',
      children: Object.keys(jsonSchema)
        .filter(
          (key) => jsonSchema[key]?.type === 'post-type' && jsonSchema[key]?.mongodb_collection_name
        )
        .map((key) => ({
          title: jsonSchema[key]?.title,
          url: `/${jsonSchema[key]?.mongodb_collection_name}`,
          key: jsonSchema[key]?.mongodb_collection_name,
        })),
    });

    return [
      ..._data,
      {
        title: 'Entity',
        key: 'list entity',
        children: Object.keys(jsonSchema)
          .filter(
            (key) =>
              jsonSchema[key]?.type !== 'post-type' &&
              jsonSchema[key]?.mongodb_collection_name &&
              !hasKey(_data, key)
          )
          .map((key) => ({
            title: jsonSchema[key]?.title,
            url: `/${jsonSchema[key]?.mongodb_collection_name}`,
            key: jsonSchema[key]?.mongodb_collection_name,
          })),
      },
    ];
  }, [tenant?.id]);

  useEffect(() => {
    if (!tenant) return;
    loadTenant();
  }, [tenant]);

  const loadTenant = async () => {
    try {
      setLoading(true);
      if (tenant?.sidebar) {
        setSelectedSidebar(tenant?.sidebar || []);
      } else {
        const getAllKeys = (data) => {
          let keys = [];
          data.forEach((item) => {
            keys.push(item.key);
            if (item.children && item.children.length > 0) {
              keys = keys.concat(getAllKeys(item.children));
            }
          });
          return keys;
        };

        const allKeys = getAllKeys(dataSidebar);
        setSelectedSidebar(allKeys);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('🚀 ~ loadTenant ~ error:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        ...tenant,
        sidebar: selectedSidebar,
      };
      await entityDataApi().updateData({
        entity: 'tenant',
        id: tenant?._id,
        data,
      });
      setTenant(data);
    } catch (error) {
      console.log('🚀 ~ handleSave ~ error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user?.role_system !== 'admin') return <></>;

  return (
    <div className='flex flex-col flex-1 h-screen overflow-hidden max-h-svh'>
      {loading ? (
        <div className='flex flex-1 items-center justify-center'>
          <Loader className='animate-spin' />
        </div>
      ) : (
        <>
          <div className='flex flex-col flex-1 gap-2 p-4 h-0 overflow-auto'>
            <p>Sidebar Setting</p>
            {tenant && selectedSidebar ? (
              <Tree
                data={dataSidebar}
                checkedKeys={selectedSidebar}
                selectedKeys={selectedSidebar}
                checkable={true}
                onCheck={(val) => {
                  setSelectedSidebar(val);
                }}
              />
            ) : null}
          </div>
          <div className='flex border-t justify-end px-2 py-1'>
            <Button
              disabled={loading}
              className='w-[100px] h-8'
              onClick={handleSave}>
              Save
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const dataDefault = [
  {
    title: 'Features',
    key: 'features',
    children: [
      {
        title: 'Entity',
        url: '/entity',
        key: 'entity',
      },
      {
        title: 'Group Field',
        url: '/group-field',
        key: 'group-field',
      },
      {
        title: 'Collection',
        url: '/collection',
        key: 'collection',
      },
      {
        title: 'Role',
        url: '/role',
        key: 'role',
      },
      {
        title: 'API Key',
        url: '/api-key',
        key: 'api-key',
      },
      {
        title: 'Media',
        url: '/media',
        key: 'media',
      },
      {
        title: 'Menu',
        url: '/menu',
        key: 'menu',
      },
      {
        title: 'Templates',
        url: '/templates',
        key: 'templates',
      },
      {
        title: 'User',
        url: '/user',
        key: 'user',
      },
      {
        title: 'Tenant',
        url: '/tenant',
        key: 'tenant',
      },
      {
        title: 'Layout',
        url: '/layout',
        key: 'layout',
      },
    ],
  },
  {
    title: 'API',
    key: 'api',
    children: [
      { title: 'API Setting', url: '/role-settings', key: 'role-settings' },
      { title: 'Flow Setting', url: '/workflow-settings', key: 'workflow-settings' },
      { title: 'Validate', url: '/validate', key: 'validate' },
      { title: 'Response', url: '/response', key: 'response' },
      { title: 'Notification', url: '/notification', key: 'notification' },
      { title: 'Documents', url: '/documents', key: 'documents' },
      { title: 'Task', url: '/task', key: 'task' },
    ],
  },
  {
    title: 'AI',
    key: 'ai',
    children: [
      { title: 'Page AI', url: '/page-ai', key: 'page-ai' },
      { title: 'Generate Data AI', url: '/generate-data-ai', key: 'generate-data-ai' },
      { title: 'Flow AI', url: '/flow-api', key: 'flow-api' },
      { title: 'Prompt Design', url: '/prompt-design', key: 'prompt-design' },
    ],
  },
];
