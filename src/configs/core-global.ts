import { createCoreSystem } from "../core/bootstrap";
import { NewCore } from "../core/main/newCore";
import { settingCore } from "./app-settings";
export let coreGlobal: NewCore;

export const InitialCore = async () => {
  coreGlobal = await createCoreSystem(settingCore);
};


