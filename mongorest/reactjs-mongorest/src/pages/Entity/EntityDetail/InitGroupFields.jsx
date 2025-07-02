import { JsonForm } from '@/components/builders';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function InitGroupFields({ schema, formData, setFormData, showTagFields }) {
  const handleChangeSlug = (e, locale) => {
    const { value } = e.target;
    const _formData = JSON.parse(JSON.stringify(formData));
    if (!_formData?.languages) {
      _formData.languages = [{ locale, slug: value }];
    } else {
      const item = _formData.languages.find((item) => item.locale === locale);
      if (item) {
        item.slug = value;
      } else {
        _formData.languages.push({ locale, slug: value });
      }
    }
    setFormData(_formData);
  };

  return (
    <>
      <JsonForm
        title='Information'
        schema={schema.json}
        uischema={schema.ui}
        initFormData={formData}
        onChangeFormData={setFormData}>
        {showTagFields ? (
          <div className='flex gap-1'>
            {[
              '_id',
              'created_at',
              'updated_at',
              'created_by',
              'updated_by',
              ...(formData?.use_block ? ['blocks'] : []),
              ...(formData?.use_parent ? ['parent_id'] : []),
            ].map((item) => (
              <div className='bg-primary text-primary-foreground rounded-[12px] px-4 py-[2px]'>
                <p className='text-[12px] font-semibold'>{item}</p>
              </div>
            ))}
          </div>
        ) : null}
      </JsonForm>
      {formData?.use_locale ? (
        <div
          className='rounded-sm px-10 py-6 mt-6'
          style={{ boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }}>
          <div className='flex gap-[4px]'>
            <span className='text-red-600 text-[16px] pt-[2px]'>*</span>
            <p className='text-[24px] font-bold'>Languages</p>
          </div>
          <p className='text-xs text-[#727272] mb-4'>Nhập slug cho các ngôn ngữ còn lại</p>
          <div className='flex flex-col gap-2'>
            {['vi', 'en'].map((item) => (
              <div
                className='flex gap-2'
                key={item}>
                <Button
                  variant='outline'
                  className='uppercase w-[60px]'>
                  {item}
                </Button>
                <Input
                  value={formData?.languages?.find((i) => i.locale === item)?.slug}
                  onChange={(e) => handleChangeSlug(e, item)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default InitGroupFields;
