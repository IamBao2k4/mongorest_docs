import { PostgRESTToMongoConverter } from "../main/mongorest"; 
import { FilterParser } from "../parsers/filterParser";

type TestCase = {
  [key: string]: string;
};
const converter = new PostgRESTToMongoConverter();
const filterParser = new FilterParser();

console.log('=== Error Handling Examples ===');

// Test cases that should handle errors gracefully
const errorTestCases: {
  name: string,
  params: TestCase,
  expectError: boolean
}[] = [
  {
    name: 'Unknown operator',
    params: { age: 'unknown.25' },
    expectError: true
  },
  {
    name: 'Malformed array',
    params: { status: 'in.(active,pending' }, // Missing closing parenthesis
    expectError: false // Should handle gracefully
  },
  {
    name: 'Invalid logical expression',
    params: { or: 'malformed expression' },
    expectError: false // Should handle gracefully
  },
  {
    name: 'Empty values',
    params: { name: '', age: 'eq.' },
    expectError: false // Should handle gracefully
  },
  {
    name: 'Complex nested logic',
    params: { or: '(and=(age.gte.18,age.lte.65),status.eq.premium)' },
    expectError: false
  }
];

errorTestCases.forEach(testCase => {
  console.log(`\nTesting: ${testCase.name}`);
  console.log('Input:', testCase.params);
  
  try {
    const result = converter.convert(testCase.params);
    console.log('Success:', JSON.stringify(result, null, 2));
    
    if (testCase.expectError) {
      console.log('❌ Expected error but succeeded');
    } else {
      console.log('✅ Handled successfully');
    }
  } catch (error: any) {
    if (testCase.expectError) {
      console.log('✅ Expected error:', error.message);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
});