import { getCardBody } from '@/helpers/utils';

export default function GeneralParameterInputs({
  category,
  parameters,
  onChange,
  mods,
  allFormInputs,
}) {
  const CardBody = getCardBody(category, allFormInputs);
  return (
    <div>
      <CardBody
        parameters={parameters}
        onChange={onChange}
        mods={mods || {}}
      />
    </div>
  );
}
