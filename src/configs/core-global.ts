import { createCoreSystem } from "../mongorest_core/bootstrap";
import { NewCore } from "../mongorest_core/main/newCore";
import { settingCore } from "./app-settings";
export let coreGlobal: NewCore;

export const InitialCore = async () => {
  coreGlobal = await createCoreSystem(settingCore);
};


