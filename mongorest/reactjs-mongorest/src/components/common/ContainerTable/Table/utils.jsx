import { Fields } from '@/components/builders/fields/fields';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';

const keyHref = [
  'title',
  'first_name',
  'last_name',
  'username',
  'name',
  'path',
  'featured_image',
  'featured_image_1',
  'featured_image_2',
  '_id',
];

const _renderHeader = ({ header, pathname, isModal, setFilterQuery, settings, onClickRow }) => {
  return header?.map((item) => {
    return {
      accessorKey: item.dataIndex,
      header: item.title,
      cell: ({ row }) => {
        const Component = Fields[item.component];
        if (!Component) return <></>;

        const rowValue = row.original;
        let value = item?.group
          ? rowValue?.[item?.group]?.[item?.key] || rowValue?.[item?.group]?.[item?.dataIndex]
          : rowValue?.[item?.key] || rowValue?.[item?.dataIndex];
        const href =
          (!isModal && keyHref.includes(item.key)) || settings?.title === item?.key
            ? `${pathname}/${rowValue.locale_id || rowValue._id}`
            : null;
        return (
          <div className='flex flex-1'>
            <div className='w-max flex flex-1 max-w-[400px]'>
              <Component
                type='table'
                inforFields={{
                  key: item?.typeRelation?.title,
                  keyTable: item?.key,
                }}
                value={['title', 'name'].includes(item.key) ? (value ? value : 'NO DATA') : value}
                onChangeFilterQuery={item.widget === 'relation' ? setFilterQuery : () => {}}
                onClick={onClickRow}
                schema={{
                  ...item,
                  href,
                }}
              />
            </div>
          </div>
        );
      },
    };
  });
};

const _renderAction = (actions, lang) => {
  try {
    if (!actions) return [];
    return [
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => {
          return <div></div>;
        },
      },
    ];
  } catch (err) {
    console.log('🚀 ~ err:', err);
    return [];
  }
};

export function getHeaders({
  header,
  pathname,
  isModal,
  setFilterQuery,
  typeSelectRow,
  actions,
  lang,
  settings,
  onClickRow,
}) {
  const _header = _renderHeader({
    header,
    pathname,
    isModal,
    setFilterQuery,
    settings,
    onClickRow,
  });
  const _actions = _renderAction(actions, lang);

  return [
    {
      id: 'select',
      header: ({ table }) =>
        typeSelectRow === 'radio' ? (
          <div className='w-7'></div>
        ) : (
          <div className='w-7'>
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label='Select all'
              className='size-3'
            />
          </div>
        ),
      cell: ({ row }) => {
        if (typeSelectRow === 'radio') {
          const value = row.original._id;
          return (
            <RadioGroup
              value={row.getIsSelected() ? value : null}
              onValueChange={() => {
                row.toggleSelected(true);
              }}>
              <RadioGroupItem
                value={value}
                id={value}
              />
            </RadioGroup>
          );
        }
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
            className='size-3'
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    ,
    ...(_header || []),
    ..._actions,
  ];
}
