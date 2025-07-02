import { Suspense, useEffect, useState } from 'react';
import CardContainer from './CardContainer';
import { get_data_relation } from '@/helpers/get_data_relation';

const Cards = ({ detailPage, ...props }) => {
  const __props = JSON.parse(JSON.stringify(props));
  const [state, setState] = useState({});

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(__props)]);

  const fetchData = async () => {
    try {
      const __props = JSON.parse(JSON.stringify(props));
      const { limit, tabs, related } = __props?.getData || {};
      const { type = 'posttype', data } = tabs?.[0] || {};
      const { data: dataDefault, meta: metaDefault } = await get_data_relation({
        filter: {
          limit: limit || 6,
          page: 1,
        },
        type,
        data,
        lang: __props?.lang,
        related,
        detailPage,
      });

      setState({
        dataDefault,
        metaDefault,
      });
    } catch (error) {
      console.log('🚀: fetchData -> error', error);
    }
  };
  return (
    <Suspense>
      <CardContainer
        {...__props}
        {...state}
        key={JSON.stringify(state)}
      />
    </Suspense>
  );
};

export default Cards;
