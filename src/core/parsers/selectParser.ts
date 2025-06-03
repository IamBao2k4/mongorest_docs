/**
 * Handles SELECT clause parsing for projection
 */
export class SelectParser {
  /**
   * Parse select parameter like "first_name,age" or "fullName:full_name,birthDate:birth_date"
   */
  parseSelect(selectClause: string): Record<string, 1 | 0> {
    if (!selectClause || selectClause === '*') {
      return {}; // Return all fields
    }
    
    const projection: Record<string, 1> = {};
    const fields = selectClause.split(',');
    
    fields.forEach(field => {
      const trimmed = field.trim();
      
      // Handle alias format: "alias:field_name"
      if (trimmed.includes(':')) {
        const [alias, fieldName] = trimmed.split(':');
        projection[fieldName.trim()] = 1;
      } else {
        // Handle JSON path like "json_data->field" (simplified)
        const cleanField = trimmed.replace(/->>?.*$/, '');
        projection[cleanField] = 1;
      }
    });
    
    return projection;
  }
}