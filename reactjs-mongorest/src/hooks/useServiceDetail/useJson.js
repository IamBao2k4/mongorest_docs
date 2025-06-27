'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function useJson({ entity }) {
  const { jsonSchema } = useAuth();

  const jsonData = {
    json: jsonSchema[entity || 'entity']?.json,
    ui: jsonSchema[entity || 'entity'].ui,
  };

  const [schemaBuilder, setSchemaBuider] = useState({
    json: JSON.stringify({}),
    ui: JSON.stringify({}),
  });

  const posttype = jsonSchema[entity]?.type === 'post-type' ? jsonSchema[entity]?._id : null;

  return {
    posttype,
    schema: {
      json: JSON.stringify(jsonData.json),
      ui: JSON.stringify(jsonData.ui),
    },
    schemaBuilder,
    setSchemaBuider,
  };
}

export const formatDataJson = (data) => {
  if (data) {
    let schemaLeft, schemaRight, schemaCustom, schemaMenuItems;
    let JSONschema = JSON.parse(JSON.stringify(data.json));
    let UISchema = JSON.parse(JSON.stringify(data.ui));

    schemaLeft = {
      json: JSON.stringify(JSONschema),
      ui: JSON.stringify(UISchema),
    };

    if (JSONschema.properties.custom_fields) {
      schemaCustom = {
        json: JSON.stringify(JSONschema.properties.custom_fields),
        ui: JSON.stringify(UISchema.custom_fields),
      };
    }

    if (JSONschema.properties.menu_items) {
      schemaMenuItems = {
        json: JSON.stringify(JSONschema.properties.menu_items),
        ui: JSON.stringify(UISchema.menu_items),
      };
    }
    return {
      schemaLeft,
      schemaRight,
      schemaCustom,
      schemaMenuItems,
    };
  } else {
    return {};
  }
};
