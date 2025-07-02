import getHeaderInPosttype from './getHeaderInPosttype';
import collection from '../data/entity/collection.json';
import media from '../data/entity/media.json';
import menuDefault from '../data/entity/menu-default.json';
import roleSettings from '../data/entity/role-settings.json';
import role from '../data/entity/role.json';
import user from '../data/entity/user.json';
import prompts from '../data/entity/prompts-tree.json';
import apiKey from '../data/entity/api-key.json';
const dataJson = {
  collection,
  media,
  ['menu-default']: menuDefault,
  ['role-settings']: roleSettings,
  role,
  user,
  ['prompts-tree']: prompts,
  ['api-key']: apiKey,
};

function getDataJson(isPost = true) {
  let files = {};

  try {
    Object.keys(dataJson).forEach((key) => {
      const data = dataJson[key];
      const filter = getHeaderInPosttype({
        data,
        isPottype: isPost,
      });
      files[key] = { ...data, filter };
    });
  } catch (error) {
    console.log('🚀 ~ getDataJson ~ error:', error);
  }

  return files;
}

export default getDataJson;
