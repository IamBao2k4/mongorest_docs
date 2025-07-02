import CardShadow from '@/components/common/Card';
import {
  addSectionObj,
  addSelectCardObj,
  countElementsFromSchema,
  generateElementComponentsFromSchemas,
  onDragEnd,
} from '@/helpers/utils';
import { Fragment, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Collapse } from '..';
import Add from '../Add';
import Card from '../Card';
import WrapperSetting from '../WrapperSetting';
import { useStyles } from './styles';
import { Switch } from '@/components/ui/Switch';
import { GripVertical } from 'lucide-react';

export default function Section({
  name,
  required,
  schema,
  uischema,
  onChange,
  onNameChange,
  onRequireToggle,
  onDependentsChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  cloneSectionObj,
  path,
  definitionData,
  definitionUi,
  hideKey,
  reference,
  dependents,
  dependent,
  parent,
  neighborNames,
  addElem,
  cardOpen,
  setCardOpen,
  allFormInputs,
  mods,
  categoryHash,
  type,
  fields,
  elKey = null,
}) {
  const classes = useStyles();
  const schemaData = schema || {};
  const elementNum = countElementsFromSchema(schemaData);
  const [cardOpenArray, setCardOpenArray] = useState([...Array(elementNum)].map(() => false));
  const [titleState, setTitleState] = useState(schemaData.title);

  const [keyName, setKeyName] = useState(name);
  const [stateKeySection, setStateKeySection] = useState(keyName || '');
  return (
    <CardShadow>
      <Fragment>
        <Collapse
          isOpen={cardOpen}
          toggleCollapse={(e) => setCardOpen(e)}
          keyObject={elKey || keyName}
          title={
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                lineHeight: '21px',
                margin: 0,
                textAlign: 'left',
              }}>
              {schemaData.title || keyName}
            </h3>
          }
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isSection={true}
          cloneSectionObj={cloneSectionObj}
          onChange={onChange}
          className={`section-container ${classes.sectionContainer} ${
            dependent ? 'section-dependent' : ''
          } ${reference ? 'section-reference' : ''}`}>
          <div className={`section-entries ${reference ? 'section-reference' : ''}`}>
            <div className='flex flex-col gap-5 pb-5'>
              <WrapperSetting
                title='Section Object'
                required={true}
                value={stateKeySection || keyName || ''}
                onChange={(ev) => {
                  setStateKeySection(ev.target.value);
                }}
                onBlur={(ev) => {
                  const { value } = ev.target;
                  if (value === name || !(neighborNames && neighborNames.includes(value))) {
                    onNameChange(value);
                  } else {
                    setKeyName(name);
                    onNameChange(name);
                  }
                }}
              />
              <WrapperSetting
                title='Section Display'
                required={true}
                value={titleState || ''}
                onChange={(ev) => setTitleState(ev.target.value)}
                onBlur={(ev) => {
                  onChange(
                    {
                      ...schema,
                      title: ev.target.value,
                    },
                    uischema
                  );
                }}
              />
              <WrapperSetting
                title='Section Description'
                required={true}
                value={schemaData.description || ''}
                onChange={(ev) =>
                  onChange(
                    {
                      ...schema,
                      description: ev.target.value,
                    },
                    uischema
                  )
                }
              />
              <Switch
                label={'Hidden'}
                checked={schema?.hidden}
                onCheckedChange={() =>
                  onChange(
                    {
                      ...schema,
                      hidden: !schema?.hidden,
                    },
                    uischema
                  )
                }
              />
            </div>
            <div className='section-body'>
              <DragDropContext
                onDragEnd={(result) =>
                  onDragEnd(result, {
                    schema,
                    uischema,
                    onChange,
                    definitionData,
                    definitionUi,
                    categoryHash,
                  })
                }
                className='section-body'>
                <Droppable
                  direction='vertical'
                  droppableId='droppable'
                  isDropDisabled={false}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}>
                  {(providedDroppable) => (
                    <div
                      ref={providedDroppable.innerRef}
                      className='flex flex-col gap-4'
                      {...providedDroppable.droppableProps}>
                      {generateElementComponentsFromSchemas({
                        schemaData: schema,
                        uiSchemaData: uischema,
                        onChange,
                        path,
                        definitionData,
                        definitionUi,
                        cardOpenArray,
                        setCardOpenArray,
                        allFormInputs,
                        mods,
                        categoryHash,
                        Card,
                        Section,
                        type,
                        fields,
                      }).map((element, index) => (
                        <Draggable
                          key={element.key}
                          draggableId={element.key}
                          index={index}>
                          {(providedDraggable) => (
                            <div
                              className='card relative'
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}>
                              <div
                                className='absolute left-3 top-4 z-10'
                                {...providedDraggable.dragHandleProps}>
                                <div className='p-4'>
                                  <GripVertical />
                                </div>
                              </div>
                              {element}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {providedDroppable.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
            <div className='section-footer'>
              <Add
                type={type}
                fields={fields}
                addElem={(choice, type) => {
                  if (choice === 'card') {
                    addSelectCardObj(
                      {
                        schema,
                        uischema,
                        mods,
                        onChange,
                        definitionData,
                        definitionUi,
                        categoryHash,
                      },
                      type
                    );
                  } else if (choice === 'section') {
                    addSectionObj({
                      schema,
                      uischema,
                      onChange,
                      definitionData,
                      definitionUi,
                      categoryHash,
                    });
                  } else if (choice === 'clone') {
                    if (cloneSectionObj) {
                      cloneSectionObj();
                    }
                  }
                }}
              />
            </div>
          </div>
        </Collapse>
      </Fragment>
    </CardShadow>
  );
}
