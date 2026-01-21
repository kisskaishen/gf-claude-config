import { ref } from "vue";
import { defineStore } from "pinia";
import { useTagsViewStore } from "./tagsView";
import { store } from "@/store";

export const useUserStore = defineStore(
  "user",
  () => {
    const tagsViewStore = useTagsViewStore();

    // State
    const token = ref("");
    const roles = ref<string[]>([]);
    const userInfo = ref({
      name: "",
      avatar: ""
    });

    // Actions
    const login = async (_loginForm: any) => {
      // 模拟接口请求
      const fakeToken = "admin-token-" + Date.now();
      token.value = fakeToken;
    };

    const getInfo = async () => {
      // 模拟获取用户信息和角色
      // 在实际开发中，这里会请求后端接口
      const data = {
        roles: ["admin"], // 或者是 ['editor'] 等
        name: "Gofo Admin",
        avatar:
          "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
      };
      roles.value = data.roles;
      userInfo.value = { name: data.name, avatar: data.avatar };
      return data;
    };

    const logout = () => {
      token.value = "";
      roles.value = [];
      userInfo.value = { name: "", avatar: "" };
      tagsViewStore.delAllViews();
    };

    return { token, roles, userInfo, login, getInfo, logout };
  },
  {
    persist: {
      key: "dbu-user-state",
      pick: ["token", "roles", "userInfo"]
    }
  }
);

export function useUserStoreWithOut() {
  return useUserStore(store);
}
