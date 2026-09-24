import type { Component } from "vue";
import { defineAdminModule } from "@liujitcn/kratos-admin-core";


import { LOCALE_MESSAGES } from "./locales/generated";

const viewModules = import.meta.glob<{ default: Component }>("./views/**/*.vue");

/** Business 管理端业务模块。 */
export const businessAdminModule = defineAdminModule({
  name: "business",
  views: viewModules,
  messages: LOCALE_MESSAGES
});
