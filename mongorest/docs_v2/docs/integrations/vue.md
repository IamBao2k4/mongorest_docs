---
sidebar_position: 3
---

# Vue Integration

Sử dụng MongoREST với Vue.js applications.

## API Module

```javascript
// api/mongorest.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // Collections
  collection(name) {
    return {
      find(query = {}) {
        return api.get(`/${name}`, { params: query });
      },
      findOne(id) {
        return api.get(`/${name}/${id}`);
      },
      create(data) {
        return api.post(`/${name}`, data);
      },
      update(id, data) {
        return api.put(`/${name}/${id}`, data);
      },
      delete(id) {
        return api.delete(`/${name}/${id}`);
      }
    };
  },

  // Auth
  auth: {
    login(credentials) {
      return api.post('/auth/login', credentials);
    },
    register(data) {
      return api.post('/auth/register', data);
    }
  }
};
```

## Vuex Store

```javascript
// store/modules/mongorest.js
import api from '@/api/mongorest';

export default {
  namespaced: true,

  state: {
    collections: {},
    loading: false,
    error: null
  },

  mutations: {
    SET_COLLECTION(state, { name, data }) {
      state.collections[name] = data;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async fetchCollection({ commit }, { collection, query }) {
      commit('SET_LOADING', true);
      try {
        const { data } = await api.collection(collection).find(query);
        commit('SET_COLLECTION', { name: collection, data });
        return data;
      } catch (error) {
        commit('SET_ERROR', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async createDocument({ dispatch }, { collection, data }) {
      const { data: result } = await api.collection(collection).create(data);
      await dispatch('fetchCollection', { collection });
      return result;
    },

    async updateDocument({ dispatch }, { collection, id, data }) {
      const { data: result } = await api.collection(collection).update(id, data);
      await dispatch('fetchCollection', { collection });
      return result;
    },

    async deleteDocument({ dispatch }, { collection, id }) {
      await api.collection(collection).delete(id);
      await dispatch('fetchCollection', { collection });
    }
  },

  getters: {
    getCollection: (state) => (name) => {
      return state.collections[name] || [];
    }
  }
};
```

## Vue 3 Composable

```javascript
// composables/useMongoRest.js
import { ref, computed, watch } from 'vue';
import api from '@/api/mongorest';

export function useCollection(collectionName, initialQuery = {}) {
  const data = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const query = ref(initialQuery);

  const fetch = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.collection(collectionName).find(query.value);
      data.value = response.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  // Auto-fetch on query change
  watch(query, fetch, { deep: true, immediate: true });

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    query,
    refresh: fetch
  };
}

export function useDocument(collectionName, id) {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetch = async () => {
    if (!id.value) return;
    
    loading.value = true;
    error.value = null;
    try {
      const response = await api.collection(collectionName).findOne(id.value);
      data.value = response.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  watch(id, fetch, { immediate: true });

  const save = async (updates) => {
    const response = await api.collection(collectionName).update(id.value, updates);
    data.value = response.data;
    return response.data;
  };

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    save,
    refresh: fetch
  };
}
```

## Component Example

```vue
<template>
  <div>
    <h1>Users</h1>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    
    <ul v-else>
      <li v-for="user in data" :key="user._id">
        {{ user.name }} - {{ user.email }}
        <button @click="deleteUser(user._id)">Delete</button>
      </li>
    </ul>
    
    <button @click="refresh">Refresh</button>
  </div>
</template>

<script setup>
import { useCollection } from '@/composables/useMongoRest';
import api from '@/api/mongorest';

const { data, loading, error, refresh } = useCollection('users', {
  order: 'name.asc',
  limit: 20
});

const deleteUser = async (id) => {
  if (confirm('Are you sure?')) {
    await api.collection('users').delete(id);
    refresh();
  }
};
</script>
```