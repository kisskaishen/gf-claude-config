import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useResetableRef } from "./useResetableRef";

describe("useResetableRef", () => {
  it("初始状态应为传入的初始值（基本类型）", () => {
    // Act
    const { state } = useResetableRef(42);

    // Assert
    expect(state.value).toBe(42);
  });

  it("初始状态应为传入的初始值（对象类型）", () => {
    // Act
    const { state } = useResetableRef({ name: "test", age: 30 });

    // Assert
    expect(state.value).toEqual({ name: "test", age: 30 });
  });

  it("reset 应恢复到初始值（基本类型）", () => {
    // Arrange
    const { state, reset } = useResetableRef(42);

    // Act
    state.value = 100;
    reset();

    // Assert
    expect(state.value).toBe(42);
  });

  it("reset 应恢复到初始值（对象类型），且是深拷贝不影响初始值", () => {
    // Arrange
    const { state, reset } = useResetableRef({ name: "test", items: [1, 2] });

    // Act
    state.value.name = "modified";
    state.value.items.push(3);
    reset();

    // Assert
    expect(state.value).toEqual({ name: "test", items: [1, 2] });
  });

  it("多次修改后 reset 始终恢复到原始初始值", () => {
    // Arrange
    const { state, reset } = useResetableRef("initial");

    // Act
    state.value = "first change";
    reset();
    expect(state.value).toBe("initial");

    state.value = "second change";
    reset();
    expect(state.value).toBe("initial");
  });

  it("外部修改原始对象不影响内部初始值", () => {
    // Arrange
    const externalObj = { count: 0 };
    const { state, reset } = useResetableRef(externalObj);

    // Act - modify external object after creation
    externalObj.count = 999;
    state.value = { count: 50 };
    reset();

    // Assert - reset restores to the initial snapshot, not the mutated external obj
    expect(state.value).toEqual({ count: 0 });
  });

  it("数组类型的初始值正确支持 reset", () => {
    // Arrange
    const { state, reset } = useResetableRef([1, 2, 3]);

    // Act
    state.value.push(4, 5);
    reset();

    // Assert
    expect(state.value).toEqual([1, 2, 3]);
  });
});
