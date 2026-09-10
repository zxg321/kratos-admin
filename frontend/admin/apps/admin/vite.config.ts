import { defineAdminAppViteConfig } from "@liujitcn/admin-vite-config/admin";
import { adminModuleOptimizeDependencies, adminModulePackages } from "./src/module-manifest";

export default defineAdminAppViteConfig({
  /** 业务模块包列表，由模块清单自动生成，用于 Vite 预构建和别名解析。 */
  modulePackages: adminModulePackages,
  /** 需要 Vite 预构建优化的依赖列表，由模块清单自动收集。 */
  optimizeDependencies: adminModuleOptimizeDependencies
});