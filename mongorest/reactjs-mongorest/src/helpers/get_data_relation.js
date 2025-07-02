import { refApi } from '@/services/refApi';

export async function get_data_relation({ filter = {}, type, data, lang, related, detailPage }) {
  const defaultLimit = 6;
  const baseQuery = {
    ...filter,
    limit: filter?.limit || defaultLimit,
  };

  if (related) {
    const result = await refApi(lang).getList({
      params: { ...baseQuery, post_type: detailPage?.post_type?.[0]?._id },
      endpoint: detailPage?.product_type?.[0]?.slug,
    });

    return {
      data: result?.data || [],
      meta: result?.meta,
    };
  }

  const firstData = data?.[0] || null;
  if (!firstData) {
    return { data: [], meta: null };
  }

  switch (type) {
    case 'product-types': {
      const result = await refApi(lang).getList({
        params: baseQuery,
        endpoint: firstData.slug,
      });

      return {
        data: result?.data || [],
        meta: result?.meta,
      };
    }

    case 'post-type': {
      if (!firstData) return { data: [], meta: null };

      const result = await refApi(lang).getList({
        params: { ...baseQuery, post_type: firstData?._id },
        endpoint: firstData?.product_type?.[0]?.slug,
      });

      return {
        data: result?.data || [],
        meta: result?.meta,
      };
    }

    case 'category': {
      const result = await refApi(lang).getList({
        params: {
          ...baseQuery,
          category: firstData._id,
          post_type: firstData?.post_type?.[0]?._id,
        },
        endpoint: firstData?.post_type?.[0]?.product_type?.[0]?.slug,
      });

      return {
        data: result?.data || [],
        meta: result?.meta,
      };
    }

    case 'post':
    case 'page-ai': {
      return {
        data,
        meta: {},
      };
    }

    default:
      return {
        data: data || [],
        meta: null,
      };
  }
}
