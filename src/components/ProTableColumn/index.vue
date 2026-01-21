<script lang="ts">
import { defineComponent, h } from "vue";
import { ElTableColumn } from "element-plus";

export default defineComponent({
  name: "ProTableColumn",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const renderValue = (val: any) => {
      if (val === null || val === undefined || val === "") {
        return "-";
      }
      return val;
    };

    return () => {
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
