import Card from '@/components/common/Card';
import { Fragment } from 'react';

function ObjectFieldTemplate(props) {
  const Component = props?.title ? Card : Fragment;
  if (props?.hidden) return <></>;
  return (
    <Component>
      {props?.title && <p className='font-medium text-[26px] text-black/80'>{props.title}</p>}
      {props?.description && <p className='text-[12px] text-black/60 mb-3'>{props?.description}</p>}
      <div className='flex flex-col'>
        {props.properties.map((element, index) => {
          if (element?.content?.props?.schema?.hidden) return <div key={index}></div>;
          return (
            <div
              className={!element?.content?.props?.schema?.layout ? 'w-full' : 'w-1/2'}
              key={index}>
              {element.content}
            </div>
          );
        })}
      </div>
    </Component>
  );
}

export default ObjectFieldTemplate;
