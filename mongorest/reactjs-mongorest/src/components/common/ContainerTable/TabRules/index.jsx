import { Tabs } from '@/components/ui/Calendar';
import { useAuth } from '@/context/AuthContext';
import { postsApi } from '@/services/index';
import pagesApi from '@/services/page';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

function TabRules({ onChangeTab, type }) {
  const params = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const { lang } = params;
  if (type !== 'pages' && type !== params?.pid) return <></>;

  const { rules } = useAuth();
  const { getPageCount } = pagesApi(lang);
  const { getPostCount } = postsApi(lang);
  const [loading, setLoading] = useState(true);
  const [tabs, setTabs] = useState([]);

  const [active, setActive] = useState(() => {
    if (searchParams.get('search[is_active:in]') && searchParams.get('search[created_by:is]')) {
      return 'me@' + searchParams.get('search[is_active:in]');
    }

    return searchParams.get('search[is_active:in]') || '';
  });

  const onGetRoleRules = async () => {
    try {
      setLoading(true);
      let result = type === 'pages' ? await getPageCount() : await getPostCount({ id: params.pid });

      const getDataNotMe = Object.keys(result).filter((item) => {
        return item != 'me';
      });
      let convertToArray = getDataNotMe.map((item) => ({
        key: `${result[item].type}`,
        label: `${result[item].name} (${result[item].total})`,
      }));

      const getCountMe = Object.keys(result['me']).map((item) => {
        return {
          label: 'My ' + result['me'][item].name + ' (' + result['me'][item].total + ')',
          key: 'me@' + result['me'][item].type,
        };
      });

      const sum = getDataNotMe.reduce((s, val) => {
        return s + result[val].total;
      }, 0);

      const _result = [
        {
          key: '',
          label: 'All page (' + sum + ')',
        },
        ...convertToArray,
        ...(rules?.findIndex((item) => item?.type === -1) !== -1 ? getCountMe : []),
      ];
      setTabs(_result);
      setLoading(false);
    } catch (err) {
      console.log('🚀 ~ onGetRoleRules ~ err:', err);
    }
  };

  useEffect(() => {
    onGetRoleRules();
  }, [lang]);

  useEffect(() => {
    if (!searchParams.get('search[is_active:in]')) setActive('');
  }, [searchParams]);

  if (loading)
    return (
      <>
        <Tabs
          items={[...Array(5).keys()].map((item) => ({
            value: item,
            label: (
              <div
                className='w-24 rounded-md bg-neutral-200 animate-pulse'
                active
                style={{ height: '22px' }}
              />
            ),
          }))}
        />
        {/* <TabsList>
            {[...Array(5).keys()].map((item) => (
              <TabsTrigger
                key={item}
                value={item}>
                <div
                  className='w-24 rounded-md bg-neutral-200 animate-pulse'
                  active
                  style={{ height: '22px' }}
                />
              </TabsTrigger>
            ))}
          </TabsList> */}
        {/* </Tabs> */}
      </>
    );
  return (
    <Tabs
      items={tabs.map((item) => ({ label: item.label, value: item.key }))}
      value={active}
      onValueChange={(val) => {
        onChangeTab(val);
        setActive(val);
      }}
    />
  );
}

export default TabRules;
