import { QueryParams } from "..";
import { PostgRESTToMongoConverter } from "../main/mongorest"; 
const converter = new PostgRESTToMongoConverter();
type TestCase = {
  [key: string]: string;
};
// Performance test function
export function performanceTest() {
  console.log('=== Performance Test ===');
  
  const testCases: TestCase[] = [
    // Simple queries
    { name: 'eq.John' },
    { age: 'gte.18', status: 'eq.active' },
    
    // Complex queries
    {
      age: 'gte.18',
      status: 'in.(active,verified,premium)',
      tags: 'cs.{javascript,typescript}',
      or: '(premium.eq.true,verified.eq.true)',
      select: 'id,name,email,status,tags',
      order: 'created_at.desc,name.asc'
    },
    
    // Text search queries
    {
      title: 'like.*JavaScript*',
      description: 'ilike.*tutorial*',
      author: 'neq.anonymous',
      tags: 'like(any).{*script,*js,react*}'
    },
    
    // Array operations
    {
      skills: 'cs.{javascript,python,java,go}',
      experience: 'ov.{frontend,backend,fullstack}',
      certifications: 'cd.{aws,azure,gcp}'
    }
  ];
  
  const iterations = 10000;
  
  testCases.forEach((testCase, index) => {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      converter.convert(testCase);
    }
    
    const end = performance.now();
    const duration = end - start;
    const avgPerOperation = duration / iterations;
    
    console.log(`Test Case ${index + 1}:`);
    console.log(`  Total time: ${duration.toFixed(2)}ms`);
    console.log(`  Average per operation: ${avgPerOperation.toFixed(4)}ms`);
    console.log(`  Operations per second: ${(1000 / avgPerOperation).toFixed(0)}`);
    console.log('');
  });
}

// Memory usage test
function memoryTest() {
  console.log('=== Memory Usage Test ===');
  
  const initialMemory = process.memoryUsage();
  console.log('Initial memory:', formatMemory(initialMemory));
  
  // Create many converters and run conversions
  const converters = [];
  for (let i = 0; i < 1000; i++) {
    converters.push(new PostgRESTToMongoConverter());
  }
  
  const testQuery = {
    age: 'gte.18',
    status: 'in.(active,verified)',
    tags: 'cs.{javascript,typescript}',
    select: 'id,name,email',
    order: 'created_at.desc'
  };
  
  // Run many conversions
  for (let i = 0; i < 10000; i++) {
    const randomConverter = converters[i % converters.length];
    randomConverter.convert(testQuery);
  }
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  const finalMemory = process.memoryUsage();
  console.log('Final memory:', formatMemory(finalMemory));
  
  console.log('Memory difference:');
  console.log(`  RSS: ${formatBytes(finalMemory.rss - initialMemory.rss)}`);
  console.log(`  Heap Used: ${formatBytes(finalMemory.heapUsed - initialMemory.heapUsed)}`);
  console.log(`  Heap Total: ${formatBytes(finalMemory.heapTotal - initialMemory.heapTotal)}`);
}

function formatMemory(memory: NodeJS.MemoryUsage) {
  return {
    rss: formatBytes(memory.rss),
    heapTotal: formatBytes(memory.heapTotal),
    heapUsed: formatBytes(memory.heapUsed),
    external: formatBytes(memory.external)
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run tests
performanceTest();
memoryTest();