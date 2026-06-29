<script lang="ts">
import { defineComponent, h } from "vue";
import { ElTableColumn, ElTooltip } from "element-plus";

export default defineComponent({
  name: "ProTableColumn",
  inheritAttrs: false,
  props: {
    type: {
      type: String,
      default: ""
    }
  },
  setup(props, { attrs, slots }) {
    const renderValue = (val: any) => {
      if (val === null || val === undefined || val === "") {
        return "-";
      }
      return val;
    };

    /**
     * 渲染 text-wrap 类型单元格: 最多2行, 超出省略, hover 显示 el-tooltip
     */
    const renderTextWrapCell = (scope: any) => {
      const prop = attrs.prop as string;
      const rawVal = scope.row[prop];
      const displayVal = renderValue(rawVal);

      // 空值直接返回 "-", 不显示 tooltip
      if (rawVal === null || rawVal === undefined || rawVal === "") {
        return displayVal;
      }

      return h(
        ElTooltip,
        {
          content: String(rawVal),
          placement: "top",
          effect: "dark",
          popperClass: "pro-table-column-tooltip",
          hideAfter: 200
        },
        {
          default: () => h("span", { class: "text-wrap-cell" }, displayVal)
        }
      );
    };

    return () => {
      if (props.type === "text-wrap") {
        return h(
          ElTableColumn,
          {
            showOverflowTooltip: false,
            ...attrs
          },
          {
            default: (scope: any) => renderTextWrapCell(scope),
            header: slots.header
              ? (scope: any) => slots.header?.(scope)
              : undefined
          }
        );
      }

      return h(
        ElTableColumn,
        {
          showOverflowTooltip: !slots.default,
          ...attrs
        },
        {
          default: (scope: any) => {
            if (slots.default) {
              return slots.default(scope);
            }
            const prop = attrs.prop as string;
            return renderValue(scope.row[prop]);
          },
          header: slots.header
            ? (scope: any) => slots.header?.(scope)
            : undefined
        }
      );
    };
  }
});
</script>

<style scoped>
.text-wrap-cell {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  line-height: 1.4;
  word-break: break-word;
  -webkit-box-orient: vertical;
}
</style>
