export function classifyFieldsIntoGroups(defaultField, type) {
  const allFormInputs = Object.assign({}, defaultField);
  let inputKeys = Object.keys(allFormInputs)
    .filter((key) => key !== 'ref')
    .map((key) => ({ value: key, label: allFormInputs?.[key]?.displayName }));

  let group =
    type !== 'ui'
      ? [
          { label: 'Text', options: [] },
          { label: 'Number', options: [] },
          { label: 'Date Time', options: [] },
          { label: 'Choice', options: [] },
          { label: 'Relationship', options: [] },
          { label: 'File', options: [] },
          { label: 'More', options: [] },
        ]
      : [
          { label: 'Text', options: [] },
          { label: 'More', options: [] },
        ];

  if (type !== 'ui') {
    inputKeys.map((item) => {
      switch (item.value) {
        case 'shortAnswer':
        case 'password':
        case 'longAnswer':
        case 'autoGenKeyFromAnotherField':
        case 'color':
          group[0].options.push(item);
          break;
        case 'number':
        case 'range':
          group[1].options.push(item);
          break;
        case 'date':
        case 'dateTime':
        case 'time':
          group[2].options.push(item);
          break;
        case 'radio':
        case 'select':
        case 'boolean':
        case 'checkbox':
          group[3].options.push(item);
          break;
        case 'relation':
          group[4].options.push(item);
          break;
        case 'multipleFiles':
        case 'file':
        case 'multiImage':
          group[5].options.push(item);
          break;
        default:
          group[6].options.push(item);
          break;
      }
    });
  } else {
    inputKeys.map((item) => {
      switch (item.value) {
        case 'typography':
          group[0].options.push(item);
          break;
        default:
          group[1].options.push(item);
          break;
      }
    });
  }

  return group.filter((i) => i.options.length > 0);
}
