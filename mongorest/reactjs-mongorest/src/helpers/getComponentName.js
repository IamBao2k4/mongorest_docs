export default function getComponentName(key) {
  switch (key) {
    case 'shortAnswer':
    case 'UriKeyGen':
    case 'autoGenKeyFromAnotherField':
      return {
        component: 'ShortAnswer',
        condition: ['contains', 'equal', 'notEqual', 'doesNotContain', 'beginsWith', 'endsWith'],
        defaultOperator: 'contains',
      };
    case 'longAnswer':
    case 'textarea':
      return {
        component: 'TextEditor',
        condition: ['contains', 'equal', 'notEqual', 'doesNotContain'],
        defaultOperator: 'contains',
      };
    case 'boolean':
      return {
        component: 'BooleanCustom',
        condition: ['equal', 'notEqual'],
        defaultOperator: 'equal',
      };
    case 'relation':
      return {
        component: 'Relation',
        condition: ['in', 'notIn'],
        defaultOperator: 'in',
      };
    case 'numberInput':
      return {
        component: 'NumberInput',
        condition: ['equal', 'notEqual', 'lt', 'lte', 'gt', 'gte'],
        defaultOperator: 'equal',
      };
    case 'file':
      return {
        component: 'FileUpload',
        condition: ['null', 'notNull'],
        defaultOperator: 'null',
        defaultValue: 'true',
      };
    case 'multipleFiles':
      return {
        component: 'MultiFile',
        condition: ['null', 'notNull'],
        defaultOperator: 'null',
        defaultValue: 'true',
      };
    case 'time':
    case 'date':
    case 'dateTime':
      return {
        component: 'DatePickerComp',
        condition: ['between', 'notBetween', 'equal', 'notEqual'],
        defaultOperator: 'between',
      };
    default:
      return null;
  }
}
