import { createCoreSystem } from "../core/bootstrap";
import { NewCore } from "../core/main/newCore";
import { settingCore } from "./app-settings";
export let coreGlobal: NewCore;

export const InitialCore = async () => {
  coreGlobal = await createCoreSystem(settingCore);
};


export const filterPassword = (obj: any) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key.toLowerCase().includes('password')) {
        console.log(key)
        obj[key] = undefined;
      }
    }
  }
  return obj;
}