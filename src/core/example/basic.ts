import { PostgRESTToMongoConverter } from "../main/mongorest";

// Initialize converter
const converter = new PostgRESTToMongoConverter();

// Example 1: Basic filtering
console.log('=== Example 1: Basic Filtering ===');
const basicParams = {
  name: 'eq.John',
  age: 'gte.18',
  status: 'eq.active'
};

const basicResult = converter.convert(basicParams);
console.log('Input:', basicParams);
console.log('Output:', JSON.stringify(basicResult, null, 2));

// Example 2: With selection and ordering
console.log('\n=== Example 2: Selection and Ordering ===');
const advancedParams = {
  age: 'gte.21',
  verified: 'eq.true',
  select: 'id,name,email,age',
  order: 'created_at.desc,name.asc'
};

const advancedResult = converter.convert(advancedParams);
console.log('Input:', advancedParams);
console.log('Output:', JSON.stringify(advancedResult, null, 2));

// Example 3: Array operations
console.log('\n=== Example 3: Array Operations ===');
const arrayParams = {
  status: 'in.(active,pending,verified)',
  tags: 'cs.{javascript,typescript,nodejs}',
  categories: 'cd.{tech,programming,web}'
};

const arrayResult = converter.convert(arrayParams);
console.log('Input:', arrayParams);
console.log('Output:', JSON.stringify(arrayResult, null, 2));

// Example 4: Text search with patterns
console.log('\n=== Example 4: Text Search ===');
const textParams = {
  title: 'like.*JavaScript*',
  description: 'ilike.*tutorial*',
  author: 'neq.anonymous'
};

const textResult = converter.convert(textParams);
console.log('Input:', textParams);
console.log('Output:', JSON.stringify(textResult, null, 2));

// Example 5: Logical operations
console.log('\n=== Example 5: Logical Operations ===');
const logicalParams = {
  or: '(age.lt.18,age.gt.65)',
  and: '(verified.eq.true,premium.eq.true)'
};

const logicalResult = converter.convert(logicalParams);
console.log('Input:', logicalParams);
console.log('Output:', JSON.stringify(logicalResult, null, 2));

// Example 6: Null checks
console.log('\n=== Example 6: Null Checks ===');
const nullParams = {
  avatar: 'is.not_null',
  bio: 'is.null',
  deleted_at: 'is.null'
};

const nullResult = converter.convert(nullParams);
console.log('Input:', nullParams);
console.log('Output:', JSON.stringify(nullResult, null, 2));

// Example 7: Modifier operations
console.log('\n=== Example 7: Modifier Operations ===');
const modifierParams = {
  tags: 'like(any).{*script,*js,react*}',
  skills: 'like(all).{*end,front*}'
};

const modifierResult = converter.convert(modifierParams);
console.log('Input:', modifierParams);
console.log('Output:', JSON.stringify(modifierResult, null, 2));