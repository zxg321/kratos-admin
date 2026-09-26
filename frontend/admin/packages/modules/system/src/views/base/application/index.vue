<!-- 应用信息 -->
<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :key="isDefaultTenant ? 'default-tenant' : 'normal-tenant'"
      row-key="id"
      :columns="columns"
      :header-actions="headerActions"
      :request-api="requestBaseApplicationTable"
    />

    <FormDialog
      v-model="dialog.visible"
      ref="formDialogRef"
      :title="dialogTitle"
      width="640px"
      :model="formData"
      :fields="formFields"
      :rules="rules"
      label-width="100px"
      @confirm="handleSubmit"
      @close="handleCloseDialog"
    >

    </FormDialog>

    <!-- 分配用户：管理应用的可跳转访问用户（base_application_user）。 -->
    <ProDialog
      v-model="authDialog.visible"
      :title="t('system.base.application.action.assign_user')"
      width="720px"
      :show-footer="false"
      destroy-on-close
      @close="handleCloseAuthDialog"
    >
      <div class="auth-toolbar">
        <el-select
          v-model="authSelectedUserId"
          class="auth-user-select"
          filterable
          clearable
          :placeholder="t('system.base.application.placeholder.select_user')"
          :loading="authUserOptionsLoading"
        >
          <el-option v-for="option in authUserOptions" :key="String(option.value)" :label="option.label" :value="Number(option.value)" :disabled="authUserIdSet.has(Number(option.value))" />
        </el-select>
        <el-button type="primary" :disabled="!authSelectedUserId" :loading="authSubmitting" @click="handleAuthAdd">
          {{ t("common.action.confirm") }}
        </el-button>
      </div>

      <el-table v-loading="authLoading" :data="authList" row-key="id" border>
        <el-table-column prop="user_id" :label="t('system.base.application.field.auth_user')" min-width="160">
          <template #default="{ row }">{{ authUserLabelMap.get(row.user_id) ?? row.user_id }}</template>
        </el-table-column>
        <el-table-column prop="created_at" :label="t('system.base.application.field.auth_time')" min-width="180">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column :label="t('common.field.operation')" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="handleAuthRemove(row as BaseApplicationUser)">
              {{ t("common.action.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="authQuery.page_num"
        v-model:page-size="authQuery.page_size"
        class="auth-pagination"
        background
        layout="total, prev, pager, next, sizes"
        :total="authTotal"
        :page-sizes="[10, 20, 50]"
        @current-change="loadAuthList"
        @size-change="handleAuthSizeChange"
      />
    </ProDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import type { FormRules } from "element-plus";
import { CirclePlus, Delete, EditPen } from "@element-plus/icons-vue";
import type { ColumnProps, HeaderActionProps, ProTableInstance } from "@liujitcn/kratos-admin-core/components/ProTable/interface";
import ProTable from "@liujitcn/kratos-admin-core/components/ProTable";
import FormDialog from "@liujitcn/kratos-admin-core/components/Dialog/FormDialog.vue";
import ProDialog from "@liujitcn/kratos-admin-core/components/Dialog/ProDialog.vue";
import type { ProFormField, ProFormOption } from "@liujitcn/kratos-admin-core/components/ProForm/interface";
import { useAuthButtons } from "@liujitcn/kratos-admin-core/auth";
import { t } from "@liujitcn/kratos-admin-core";
import { defBaseApplicationService } from "@liujitcn/kratos-admin-system/api/system/admin/v1/base_application";
import { defBaseTenantService } from "@liujitcn/kratos-admin-system/api/system/admin/v1/base_tenant";
import { defBaseUserService } from "@liujitcn/kratos-admin-system/api/system/admin/v1/base_user";
import { formatDateTime } from "@liujitcn/kratos-admin-core/format";
import { useUserStore } from "@liujitcn/kratos-admin-core/stores/runtime";
import { DEFAULT_TENANT_CODE, requestTenantOptions } from "@liujitcn/kratos-admin-core/tenant";
import type { PageBaseApplicationRequest, BaseApplication, BaseApplicationForm, BaseApplicationUser, SetBaseApplicationStatusRequest } from "@liujitcn/kratos-admin-system/rpc/system/admin/v1/base_application";

import { buildPageRequest, normalizeSelectedIds } from "@liujitcn/kratos-admin-core/table";

defineOptions({
  name: "BaseApplication",
  inheritAttrs: false
});

const { BUTTONS } = useAuthButtons();
const localeKeyPrefix = "system.base.application";
const proTable = ref<ProTableInstance>();
const formDialogRef = ref<InstanceType<typeof FormDialog>>();
/** BaseApplicationFormState 表示应用信息表单编辑状态，选择型字段填写前允许为空。 */
type BaseApplicationFormState = Omit<BaseApplicationForm, "tenant_id"> & Partial<Pick<BaseApplicationForm, "tenant_id">>;

const userStore = useUserStore();
/** 当前登录账号是否默认租户。 */
const isDefaultTenant = computed(() => userStore.userInfo.tenant_code === DEFAULT_TENANT_CODE);
/** 树形页面行内新增时锁定继承的上下文。 */
const treeCreateState = reactive({
  lockTenant: false,
  lockParent: false
});

const dialog = reactive({
  visible: false,
  editing: false
});
const dialogTitle = computed(() => t(dialog.editing ? "common.action.edit_resource" : "common.action.create_resource", { resource: t(localeKeyPrefix + ".resource") }));

const formData = reactive<BaseApplicationFormState>({
  id: 0,
  tenant_id: undefined,
  name: "",
  code: "",
  sort: 0,
  remark: "",
  status: 1,
  url: "",
  ico: ""
});

const rules = computed<FormRules>(() => ({
  tenant_id: [{ required: true, message: t("common.validation.required_input", { field: t("system.base.application.field.tenant_id") }), trigger: "change" }],
  name: [{ required: true, message: t("common.validation.required_input", { field: t("system.base.application.field.name") }), trigger: "blur" }, { max: 50, message: t("common.validation.max_length", { field: t("system.base.application.field.name"), max: 50 }), trigger: "blur" }],
  code: [{ required: true, message: t("common.validation.required_input", { field: t("system.base.application.field.code") }), trigger: "blur" }, { max: 100, message: t("common.validation.max_length", { field: t("system.base.application.field.code"), max: 100 }), trigger: "blur" }],
  sort: [{ required: true, message: t("common.validation.required_input", { field: t("system.base.application.field.sort") }), trigger: "blur" }],
  remark: [{ max: 500, message: t("common.validation.max_length", { field: t("system.base.application.field.remark"), max: 500 }), trigger: "blur" }],
  status: [{ required: true, message: t("common.validation.required_input", { field: t("system.base.application.field.status") }), trigger: "change" }],
  url: [{ max: 2000, message: t("common.validation.max_length", { field: t("system.base.application.field.url"), max: 2000 }), trigger: "blur" }],
  ico: [{ max: 255, message: t("common.validation.max_length", { field: t("system.base.application.field.ico"), max: 255 }), trigger: "blur" }]
}));
const tenantIdFormOptions = ref<ProFormOption[]>([]);


void loadFormOptions();

/** 应用信息表单字段配置。 */
const formFields = computed<ProFormField[]>(() => [
  { prop: "tenant_id", label: t("system.base.application.field.tenant_id"), component: "select", options: tenantIdFormOptions.value, props: { disabled: Boolean(formData.id) || treeCreateState.lockTenant, placeholder: t("common.validation.required_select", { field: t("system.base.application.field.tenant_id") }), filterable: true, style: { width: "100%" } } },
  { prop: "name", label: t("system.base.application.field.name"), component: "input", props: { placeholder: t("common.validation.required_input", { field: t("system.base.application.field.name") }) } },
  { prop: "code", label: t("system.base.application.field.code"), component: "input", props: { placeholder: t("common.validation.required_input", { field: t("system.base.application.field.code") }) } },
  { prop: "sort", label: t("system.base.application.field.sort"), component: "input-number", props: { min: 0, precision: 0, controlsPosition: "right", style: { width: "100%" } } },
  { prop: "remark", label: t("system.base.application.field.remark"), component: "input", props: { placeholder: t("common.validation.required_input", { field: t("system.base.application.field.remark") }) } },
  { prop: "status", label: t("system.base.application.field.status"), component: "switch", props: { activeValue: 1, inactiveValue: 2 } },
  { prop: "url", label: t("system.base.application.field.url"), component: "input", props: { placeholder: t("common.validation.required_input", { field: t("system.base.application.field.url") }) } },
  { prop: "ico", label: t("system.base.application.field.ico"), component: "image-upload", props: { placeholder: t("common.validation.required_input", { field: t("system.base.application.field.ico") }) } }
]);

/** 应用信息表格列配置。 */
const columns = computed<ColumnProps[]>(() => [
  { type: "selection", width: 55 },
  ...(isDefaultTenant.value
	    ? ([{
        prop: "tenant_id",
        label: t(localeKeyPrefix + ".field.tenant_id"),
        minWidth: 140,
        align: "left",
        showOverflowTooltip: true,
        search: { el: "select", key: "tenant_id", props: { filterable: true }, order: 1 },
        enum: requestTenantOptions
      }] satisfies ColumnProps[])
    : []),
  { prop: "name", label: t("system.base.application.field.name"), align: "left", search: { el: "input" } },
  { prop: "code", label: t("system.base.application.field.code"), align: "left", search: { el: "input" } },
  { prop: "sort", label: t("system.base.application.field.sort"), align: "right" },
  { prop: "remark", label: t("system.base.application.field.remark"), align: "left" },
  {
    prop: "status",
    label: t("system.base.application.field.status"), align: "center",
    width: 100, dictCode: "status", dictValueType: "number", search: { el: "select" },
    cellType: "status",
    statusProps: {
      activeValue: 1,
      inactiveValue: 2,
      activeText: t("common.status.enabled"),
      inactiveText: t("common.status.disabled"),
      disabled: () => !BUTTONS.value["base:application:status"],
      beforeChange: scope => handleBeforeSetStatus(scope.row as BaseApplication)
    }
  },
  { prop: "url", label: t("system.base.application.field.url"), align: "left" },
  { prop: "ico", label: t("system.base.application.field.ico"), align: "center", cellType: "image" },
  {
    prop: "operation",
    label: t("common.field.operation"),
    width: 150,
    fixed: "right",
    cellType: "actions",
    actions: [

      {
        // 分配用户：管理该应用的可跳转访问用户（base_application_user）。
        label: t("system.base.application.action.assign_user"),
        type: 'warning',
        link: true,
        hidden: () => !BUTTONS.value["base:application:user"],
        onClick: scope => openAuthDialog(scope.row as BaseApplication)
      },
      {
        // 进入子系统：以当前登录 token 构造子系统令牌登录 URL（/tokenlogin，history 路由），
        // 子系统前端凭 token 完成 SSO（V2 统一认证下 admin 签发 token 对子系统 API 直接有效）。
        label: t("common.action.enter"),
        type: "success",
        link: true,
        icon: CirclePlus,
        hidden: scope => (scope.row as BaseApplication).status !== 1 || !(scope.row as BaseApplication).url,
        onClick: scope => handleEnterApp(scope.row as BaseApplication)
      },
      {
        label: t("common.action.edit"),
        type: "primary",
        link: true,
        icon: EditPen,
        hidden: () => !BUTTONS.value["base:application:update"],

        onClick: scope => handleOpenDialog((scope.row as BaseApplication).id)
      },
      {
        label: t("common.action.delete"),
        type: "danger",
        link: true,
        icon: Delete,
        hidden: () => !BUTTONS.value["base:application:delete"],
        onClick: scope => handleDelete(scope.row as BaseApplication)
      }
    ]
  }
]);

/** 应用信息顶部按钮配置。 */
const headerActions = computed<HeaderActionProps[]>(() => [
  {
    label: t("common.action.create"),
    type: "success",
    icon: CirclePlus,
    hidden: () => !BUTTONS.value["base:application:create"],
    onClick: () => handleOpenDialog()
  },
  {
    label: t("common.action.delete"),
    type: "danger",
    icon: Delete,
    hidden: () => !BUTTONS.value["base:application:delete"],
    disabled: scope => !scope.selectedList.length,
    onClick: scope => handleDelete(scope.selectedList as BaseApplication[])
  }
]);

/**
 * 请求应用信息列表，并适配 ProTable 固定列表字段。
 */
async function requestBaseApplicationTable(params: PageBaseApplicationRequest) {
  const requestParams = buildPageRequest(params);
  const data = await defBaseApplicationService.PageBaseApplication(requestParams);
  const list = data.base_applications ?? [];
  return { data: { ...data, list } };
}

/**
 * 刷新应用信息表格。
 */
function refreshTable() {
  proTable.value?.getTableList();
}
/** 加载表单选择项。 */
async function loadFormOptions() {
  const tenantIdFormResponse = await defBaseTenantService.OptionBaseTenant({} as Parameters<typeof defBaseTenantService.OptionBaseTenant>[0]);
  tenantIdFormOptions.value = (tenantIdFormResponse.list ?? []) as ProFormOption[];
}



/**
 * 打开应用信息弹窗。
 */
/** 进入子系统：拼装令牌登录 URL 并新窗口打开。
 *  注意三点：①portal 路由为 history 模式，URL 用路径而非 hash（/#/ 会被守卫误判未登录）；
 *  ②userStore.token 存的是 "Bearer <jwt>" 完整头值，透传前须剥离前缀；
 *  ③令牌过期须前置拦截——过期 token 透传后子系统 API 401 会被静默弹回登录页。
 *  URL 形如 {url}/tokenlogin?token=<jwt>&expires_in=<剩余秒>&user=<账号名>。 */
function handleEnterApp(row: BaseApplication) {
  if (!userStore.tokenExpiresAt || userStore.tokenExpiresAt <= Date.now()) {
    ElMessage.warning("登录已过期，请重新登录管理端后再进入子系统");
    return;
  }
  const rawToken = userStore.token.replace(/^Bearer\s+/i, "");
  const expiresIn = Math.max(60, Math.floor((userStore.tokenExpiresAt - Date.now()) / 1000));
  const base = (row.url ?? "").replace(/\/+$/, "");
  const target =
    `${base}/tokenlogin?token=${encodeURIComponent(rawToken)}` +
    `&expires_in=${expiresIn}` +
    `&user=${encodeURIComponent(userStore.userInfo.user_name ?? "")}`;
  window.open(target, "_blank");
}

async function handleOpenDialog(id?: number) {
  resetForm();
  await loadFormOptions();
  dialog.editing = Boolean(id);
  dialog.visible = true;
  if (!id) return;

  const data = await defBaseApplicationService.GetBaseApplication({ id });
  Object.assign(formData, data);

}
/**
 * 关闭应用信息弹窗。
 */
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}
/**
 * 重置应用信息表单。
 */
function resetForm() {
  formDialogRef.value?.resetFields();
  formDialogRef.value?.clearValidate();
  formData.id = 0;
  formData.tenant_id = undefined;
  formData.name = "";
  formData.code = "";
  formData.sort = 0;
  formData.remark = "";
  formData.status = 1;
  formData.url = "";
  formData.ico = "";
  treeCreateState.lockTenant = false;
  treeCreateState.lockParent = false;
}
/**
 * 提交应用信息表单。
 */
function handleSubmit() {
  formDialogRef.value?.validate()?.then(valid => {
    if (!valid) return;

    const payload = JSON.parse(JSON.stringify(formData)) as BaseApplicationForm;

    const request = payload.id
      ? defBaseApplicationService.UpdateBaseApplication({ id: payload.id, base_application: payload })
      : defBaseApplicationService.CreateBaseApplication({ base_application: payload });
    request.then(() => {
      ElMessage.success(t(payload.id ? "common.message.update_success" : "common.message.create_success", { resource: t(localeKeyPrefix + ".resource") }));
      handleCloseDialog();
      refreshTable();
    });
  });
}

/** ===================== 分配用户（应用授权用户） ===================== */

const authDialog = reactive({
  visible: false,
  /** 当前分配用户的应用行。 */
  application: null as BaseApplication | null
});
/** 可选用户下拉（按应用所属租户过滤）。 */
const authUserOptions = ref<ProFormOption[]>([]);
const authUserOptionsLoading = ref(false);
const authSelectedUserId = ref<number | undefined>(undefined);
const authList = ref<BaseApplicationUser[]>([]);
const authTotal = ref(0);
const authLoading = ref(false);
const authSubmitting = ref(false);
const authQuery = reactive({ page_num: 1, page_size: 10 });

/** 已授权用户 ID 集合，用于禁用下拉中重复授权的选项。 */
const authUserIdSet = computed(() => new Set(authList.value.map(item => item.user_id ?? 0)));
/** user_id → 用户名映射。 */
const authUserLabelMap = computed(() => new Map<number, string>(authUserOptions.value.map(option => [Number(option.value), option.label])));

/**
 * 打开分配用户弹窗。
 */
function openAuthDialog(row: BaseApplication) {
  authDialog.application = row;
  authSelectedUserId.value = undefined;
  authDialog.visible = true;
  void loadAuthUserOptions();
  void loadAuthList(1);
}

/**
 * 关闭分配用户弹窗并重置状态。
 */
function handleCloseAuthDialog() {
  authDialog.visible = false;
  authDialog.application = null;
  authSelectedUserId.value = undefined;
  authList.value = [];
  authTotal.value = 0;
  authQuery.page_num = 1;
  authQuery.page_size = 10;
}

/**
 * 加载可选用户下拉（按应用所属租户；默认租户管理员跨租户分配时按应用租户过滤）。
 */
async function loadAuthUserOptions() {
  const tenantId = authDialog.application?.tenant_id;
  authUserOptionsLoading.value = true;
  try {
    const response = await defBaseUserService.OptionBaseUser({ keyword: "", tenant_id: tenantId });
    authUserOptions.value = (response.list ?? []) as ProFormOption[];
  } finally {
    authUserOptionsLoading.value = false;
  }
}

/**
 * 请求应用授权用户分页列表。
 */
async function loadAuthList(pageNum?: number) {
  const applicationId = authDialog.application?.id;
  if (!applicationId) return;
  if (pageNum) authQuery.page_num = pageNum;
  authLoading.value = true;
  try {
    const data = await defBaseApplicationService.PageApplicationUser({
      application_id: applicationId,
      page_num: authQuery.page_num,
      page_size: authQuery.page_size
    });
    authList.value = data.base_application_users ?? [];
    authTotal.value = data.total ?? 0;
  } finally {
    authLoading.value = false;
  }
}

/** 授权用户分页大小变化：回到第一页并重新加载。 */
function handleAuthSizeChange() {
  void loadAuthList(1);
}

/**
 * 添加授权用户（后端幂等：重复授权自动跳过）。
 */
function handleAuthAdd() {
  const applicationId = authDialog.application?.id;
  const userId = authSelectedUserId.value;
  if (!applicationId || !userId) return;
  authSubmitting.value = true;
  defBaseApplicationService
    .SetApplicationUser({ application_id: applicationId, user_id: userId })
    .then(() => {
      ElMessage.success(t("system.base.application.message.auth_success"));
      authSelectedUserId.value = undefined;
      void loadAuthList();
    })
    .finally(() => {
      authSubmitting.value = false;
    });
}

/**
 * 移除授权用户。
 */
function handleAuthRemove(row: BaseApplicationUser) {
  const applicationId = authDialog.application?.id;
  if (!applicationId) return;
  const userLabel = authUserLabelMap.value.get(row.user_id ?? 0) ?? String(row.user_id ?? "");
  ElMessageBox.confirm(t("common.dialog.delete_single", { resource: userLabel }), t("common.title.warning"), {
    confirmButtonText: t("common.action.confirm"),
    cancelButtonText: t("common.action.cancel"),
    type: "warning"
  }).then(
    () => {
      defBaseApplicationService.DeleteApplicationUser({ application_id: applicationId, user_id: row.user_id }).then(() => {
        ElMessage.success(t("common.message.delete_success", { resource: t("system.base.application.field.auth_user") }));
        // 当前页删空后回退一页，避免停留在空页。
        const totalPages = Math.max(1, Math.ceil((authTotal.value - 1) / authQuery.page_size));
        void loadAuthList(Math.min(authQuery.page_num, totalPages));
      });
    },
    () => {
      ElMessage.info(t("common.dialog.cancel_delete", { resource: t("system.base.application.field.auth_user") }));
    }
  );
}

/**
 * 切换状态状态前先确认并调用后端状态接口。
 */
async function handleBeforeSetStatus(row: BaseApplication) {
  const currentStatus = (row as unknown as Record<string, unknown>)["status"];
  const nextStatus = currentStatus === 1 ? 2 : 1;
  const text = t(nextStatus === 1 ? "common.status.enabled" : "common.status.disabled");
  try {
    await ElMessageBox.confirm(t("common.dialog.status_change", { action: text, resource: t(localeKeyPrefix + ".resource") }), t("common.title.notice"), {
      confirmButtonText: t("common.action.confirm"),
      cancelButtonText: t("common.action.cancel"),
      type: "warning"
    });
    await defBaseApplicationService.SetBaseApplicationStatus({ id: row.id, status: nextStatus as SetBaseApplicationStatusRequest["status"] });
    ElMessage.success(t("common.message.status_success", { action: text }));
    refreshTable();
    return true;
  } catch {
    return false;
  }
}


/**
 * 删除应用信息，兼容单项删除与批量删除。
 */
function handleDelete(selected?: number | string | Array<number | string> | BaseApplication | BaseApplication[]) {
  const rowList = Array.isArray(selected)
    ? (selected.filter(item => typeof item === "object") as BaseApplication[])
    : selected && typeof selected === "object"
      ? [selected as BaseApplication]
      : [];
  const ids = (
    rowList.length ? rowList.map(item => item.id) : normalizeSelectedIds(selected as number | string | Array<number | string>)
  ).join(",");
  if (!ids) {
    ElMessage.warning(t("common.message.select_delete_item"));
    return;
  }

  const confirmMessage = t(rowList.length === 1 ? "common.dialog.delete_single" : "common.dialog.delete_selected", { resource: t(localeKeyPrefix + ".resource") });
  ElMessageBox.confirm(confirmMessage, t("common.title.warning"), {
    confirmButtonText: t("common.action.confirm"),
    cancelButtonText: t("common.action.cancel"),
    type: "warning"
  }).then(
    () => {
      defBaseApplicationService.DeleteBaseApplication({ ids }).then(() => {
        ElMessage.success(t("common.message.delete_success", { resource: t(localeKeyPrefix + ".resource") }));
        refreshTable();
      });
    },
    () => {
      ElMessage.info(t("common.dialog.cancel_delete", { resource: t(localeKeyPrefix + ".resource") }));
    }
  );
}
</script>

<style scoped lang="scss">
.auth-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;

  .auth-user-select {
    flex: 1;
  }
}

.auth-pagination {
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
