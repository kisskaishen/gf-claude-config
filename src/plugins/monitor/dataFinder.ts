import SDK from "@datarangers/sdk-javascript";
import { SDK_CONFIG } from "./config";
import { useUserStoreWithOut } from "@/store/user";
import { useAppStoreWithOut } from "@/store/app";
class DataFinder {
  private isInitialized = false;
  constructor() {
    // 移除构造函数中的自动初始化
  }
  public init() {
    try {
      if (!this.isInitialized) {
        SDK.init(SDK_CONFIG);
        this.initUser();
        SDK.start();
        this.isInitialized = true;
        console.log("[DataFinder] SDK 初始化成功");
      }
    } catch (error) {
      console.error("[DataFinder] SDK 初始化失败", error);
    }
  }

  initUser(): void {
    const { userInfo } = useUserStoreWithOut();
    const { site } = useAppStoreWithOut();
    if (userInfo?.id) {
      const userIdsStr = `${site}-des-${userInfo.id}`;
      SDK.config({
        user_unique_id: userIdsStr,
        user_id: userInfo.id,
        device_platform: "web"
      });
    }
  }

  /**
   * 收集事件
   * @param eventName 事件名称
   * @param eventData 事件数据
   */
  public collectEvent(eventName: string, eventData?: Record<string, any>) {
    try {
      if (!this.isInitialized) {
        console.error("[DataFinder] SDK 未初始化");
        return;
      }
      SDK.event(eventName, eventData);
    } catch (error) {
      console.error("[DataFinder] 收集事件失败", error);
    }
  }
}

export const dataFinder = new DataFinder();
