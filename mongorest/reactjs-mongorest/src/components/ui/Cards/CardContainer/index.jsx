import Card from './CardContainer';

function CardContainer({ detailPage, ...props }) {
  const __props = JSON.parse(JSON.stringify(props));
  const { tabs } = __props?.getData || {};
  const { type = 'posttype' } = tabs?.[0] || {};

  return (
    <Card
      key={JSON.stringify(props?.getData)}
      {...props}
      {...(props?.getData ? props?.getData : {})}
      href={props?.getData?.tabs?.[0]?.href}
      type={type}
      isFilter={props?.showFilter}
      detailPage={detailPage}
    />
  );
}

export default CardContainer;
