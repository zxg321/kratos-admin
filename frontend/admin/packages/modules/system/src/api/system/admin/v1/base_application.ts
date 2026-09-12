import service from "@liujitcn/kratos-admin-core/request";
import { type BaseApplicationForm, type BaseApplicationService, type CreateBaseApplicationRequest, type DeleteBaseApplicationRequest, type GetBaseApplicationRequest, type OptionBaseApplicationRequest, type PageBaseApplicationRequest, type PageBaseApplicationResponse, type SetBaseApplicationStatusRequest, type UpdateBaseApplicationRequest } from "@liujitcn/kratos-admin-system/rpc/system/admin/v1/base_application";
import { type Empty } from "@liujitcn/kratos-admin-system/rpc/google/protobuf/empty";
import { type SelectOptionResponse } from "@liujitcn/kratos-admin-system/rpc/common/v1/common";

const BASE_APPLICATION_URL = "/v1/admin/base/application";

/** 应用信息服务。 */
export class BaseApplicationServiceImpl implements BaseApplicationService {

  /** 查询下拉选择 */
  OptionBaseApplication(request: OptionBaseApplicationRequest): Promise<SelectOptionResponse> {
    return service<OptionBaseApplicationRequest, SelectOptionResponse>({
      url: BASE_APPLICATION_URL + "/option",
      method: "get",
      params: request
    });
  }

  /** 查询分页列表 */
  PageBaseApplication(request: PageBaseApplicationRequest): Promise<PageBaseApplicationResponse> {
    return service<PageBaseApplicationRequest, PageBaseApplicationResponse>({
      url: BASE_APPLICATION_URL,
      method: "get",
      params: request
    });
  }

  /** 查询详情 */
  GetBaseApplication(request: GetBaseApplicationRequest): Promise<BaseApplicationForm> {
    return service<GetBaseApplicationRequest, BaseApplicationForm>({
      url: BASE_APPLICATION_URL + "/" + request.id,
      method: "get"
    });
  }

  /** 创建 */
  CreateBaseApplication(request: CreateBaseApplicationRequest): Promise<Empty> {
    return service<BaseApplicationForm | undefined, Empty>({
      url: BASE_APPLICATION_URL,
      method: "post",
      data: request.base_application
    });
  }

  /** 更新 */
  UpdateBaseApplication(request: UpdateBaseApplicationRequest): Promise<Empty> {
    return service<BaseApplicationForm | undefined, Empty>({
      url: BASE_APPLICATION_URL + "/" + request.id,
      method: "put",
      data: request.base_application
    });
  }

  /** 删除 */
  DeleteBaseApplication(request: DeleteBaseApplicationRequest): Promise<Empty> {
    return service<DeleteBaseApplicationRequest, Empty>({
      url: BASE_APPLICATION_URL + "/" + request.ids,
      method: "delete"
    });
  }

  /** 设置状态 */
  SetBaseApplicationStatus(request: SetBaseApplicationStatusRequest): Promise<Empty> {
    return service<SetBaseApplicationStatusRequest, Empty>({
      url: BASE_APPLICATION_URL + "/" + request.id + "/status",
      method: "put",
      data: request
    });
  }
}

export const defBaseApplicationService = new BaseApplicationServiceImpl();
