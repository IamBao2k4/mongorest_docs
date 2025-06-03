import { BaseOperator } from "../operators/baseOperator";
import { FilterParser } from "../parsers/filterParser";

// Custom operator example: 'between' operator
class BetweenOperator extends BaseOperator {
  readonly name = 'between';
  
  convert(field: string, value: any): Record<string, any> {
    // Expected format: between.(10,100)
    const values = this.parseArray(value);
    if (values.length !== 2) {
      throw new Error('Between operator requires exactly 2 values');
    }
    
    return {
      [field]: {
        $gte: values[0],
        $lte: values[1]
      }
    };
  }
}

// Custom operator example: 'distance' operator for geospatial queries
class DistanceOperator extends BaseOperator {
  readonly name = 'distance';
  
  convert(field: string, value: any): Record<string, any> {
    // Expected format: distance.(lat,lng,radius)
    const values = this.parseArray(value);
    if (values.length !== 3) {
      throw new Error('Distance operator requires lat, lng, and radius');
    }
    
    const [lat, lng, radius] = values;
    return {
      [field]: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius
        }
      }
    };
  }
}

// Demo custom operators
console.log('=== Custom Operators Demo ===');

const filterParser = new FilterParser();

// Register custom operators (note: this would need to be added to FilterParser class)
// filterParser.registerOperator(new BetweenOperator());
// filterParser.registerOperator(new DistanceOperator());

// Simulate usage
const betweenOp = new BetweenOperator();
console.log('Between operator:');
console.log('Input: age=between.(18,65)');
console.log('Output:', betweenOp.convert('age', '(18,65)'));

const distanceOp = new DistanceOperator();
console.log('\nDistance operator:');
console.log('Input: location=distance.(40.7128,-74.0060,1000)');
console.log('Output:', distanceOp.convert('location', '(40.7128,-74.0060,1000)'));


export {
  BetweenOperator,
  DistanceOperator
};