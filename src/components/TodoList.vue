<template>
  <div class="todo-card">
    <div class="card-header">
      <span class="header-title">Todo List</span>
      <div class="action-btn add-btn" @click="openAddDialog" title="添加任务">
        +
      </div>
    </div>

    <ul class="list-container">
      <li v-for="(item, index) in todos" :key="item.id" class="list-item">
        <div
          class="custom-checkbox"
          :class="{ checked: item.done }"
          @click="toggleTodo(index)"
        >
          <span v-if="item.done" class="check-mark">✔</span>
        </div>
        <span class="item-text" :class="{ done: item.done }">{{
          item.text
        }}</span>
        <div
          class="action-btn delete-btn"
          @click.stop="removeTodo(index)"
          title="删除任务"
        >
          -
        </div>
      </li>
    </ul>

    <!-- 🔥 修改：添加类名 todo-dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="添加新任务"
      width="300px"
      class="todo-dialog"
      center
      :append-to-body="true"
    >
      <el-input
        v-model="newTodoText"
        placeholder="输入内容后按回车..."
        @keyup.enter="addTodo"
        autofocus
      />
      <template #footer>
        <!-- 按钮也加上类名方便控制 -->
        <el-button @click="dialogVisible = false" class="cancel-btn"
          >取消</el-button
        >
        <el-button type="primary" @click="addTodo" class="confirm-btn"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";

export interface Todo {
  // 导出接口供其他组件使用
  id: number;
  text: string;
  done: boolean;
  completedDate?: string; // 新增字段：YYYY-MM-DD
}

const STORAGE_KEY = "flow-space-todos";
const HISTORY_TODOS_KEY = "flow-todos-history";

const todos = ref<Todo[]>([]);
const dialogVisible = ref(false);
const newTodoText = ref("");

// 👇 新增：将完成的任务归档到历史记录中
const saveToHistory = (todo: Todo) => {
  const historyStr = localStorage.getItem(HISTORY_TODOS_KEY);
  let history: Todo[] = historyStr ? JSON.parse(historyStr) : [];

  // 查找是否已存在，存在则更新，不存在则添加
  const existingIndex = history.findIndex((t) => t.id === todo.id);
  if (existingIndex > -1) {
    history[existingIndex] = todo;
  } else {
    history.push(todo);
  }
  localStorage.setItem(HISTORY_TODOS_KEY, JSON.stringify(history));
};

// 👇 新增：如果取消完成，从历史记录中移除
const removeFromHistory = (id: number) => {
  const historyStr = localStorage.getItem(HISTORY_TODOS_KEY);
  if (!historyStr) return;
  let history: Todo[] = JSON.parse(historyStr);
  history = history.filter((t) => t.id !== id);
  localStorage.setItem(HISTORY_TODOS_KEY, JSON.stringify(history));
};

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      todos.value = JSON.parse(saved);
    } catch (e) {
      todos.value = getDefaultTodos();
    }
  } else {
    todos.value = getDefaultTodos();
  }
});

const getDefaultTodos = () => [
  { id: 1, text: "Finish homework", done: false },
  { id: 2, text: "Read a book", done: true },
];
watch(
  todos,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true }
);

const toggleTodo = (index: number) => {
  const todo = todos.value[index];
  if (todo) {
    todo.done = !todo.done;

    // 如果完成了，记录日期并保存到历史
    if (todo.done) {
      todo.completedDate = new Date().toISOString().split("T")[0];
      saveToHistory(todo);
    } else {
      // 如果取消完成，清除日期并从历史移除
      todo.completedDate = undefined;
      removeFromHistory(todo.id);
    }
  }
};
const removeTodo = (index: number) => {
  todos.value.splice(index, 1);
};
const openAddDialog = () => {
  newTodoText.value = "";
  dialogVisible.value = true;
};
const addTodo = () => {
  if (!newTodoText.value.trim()) {
    ElMessage.warning("内容不能为空");
    return;
  }
  todos.value.push({ id: Date.now(), text: newTodoText.value, done: false });
  dialogVisible.value = false;
  ElMessage.success("添加成功");
};
</script>

<style scoped>
/* 原有样式保持不变 */
.todo-card {
  width: 280px;
  background: var(--panel-bg);
  backdrop-filter: blur(4px);
  padding: 20px;
  border-radius: var(--border-radius);
  color: var(--text-color);
  font-family: inherit;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  border: var(--panel-border);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--text-color);
  opacity: 0.8;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.header-title {
  font-size: 28px;
  font-weight: bold;
}
.list-container {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 350px;
  overflow-y: auto;
}
.list-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
}
.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--text-color);
  margin-right: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}
.custom-checkbox.checked {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: #000;
}
.check-mark {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}
.item-text {
  font-size: 20px;
  flex: 1;
  margin-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-text.done {
  text-decoration: line-through;
  opacity: 0.6;
}
.action-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: Arial, sans-serif;
  font-weight: bold;
  border-radius: 4px;
  transition: all 0.2s;
  user-select: none;
}
.add-btn {
  font-size: 32px;
  color: var(--accent-color);
  line-height: 26px;
}
.add-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.delete-btn {
  font-size: 36px;
  color: var(--text-color);
  line-height: 22px;
  opacity: 0.7;
}
.delete-btn:hover {
  color: #ff4d4f;
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}
</style>

<!-- 🔥🔥🔥 新增：全局样式覆盖，修复弹窗丑陋问题 🔥🔥🔥 -->
<style>
.el-dialog.todo-dialog {
  background: var(--panel-bg) !important;
  border: var(--panel-border) !important;
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(10px);
}

.todo-dialog .el-dialog__title {
  color: var(--text-color) !important;
  font-family: inherit;
  font-weight: bold;
}

.todo-dialog .el-dialog__headerbtn .el-dialog__close {
  color: var(--text-color) !important;
}
.todo-dialog .el-dialog__headerbtn .el-dialog__close:hover {
  color: var(--accent-color) !important;
}

/* 输入框样式 */
.todo-dialog .el-input__wrapper {
  background: transparent !important;
  box-shadow: 0 0 0 1px var(--text-color) inset !important;
}
.todo-dialog .el-input__inner {
  color: var(--text-color) !important;
  font-family: inherit;
}

/* 按钮样式 */
.todo-dialog .cancel-btn {
  background: transparent !important;
  border: 1px solid var(--text-color) !important;
  color: var(--text-color) !important;
}
.todo-dialog .cancel-btn:hover {
  opacity: 0.8;
}

.todo-dialog .confirm-btn {
  background: var(--accent-color) !important;
  border: 1px solid var(--accent-color) !important;
  color: #000 !important;
  font-weight: bold;
}
.todo-dialog .confirm-btn:hover {
  opacity: 0.9;
  transform: scale(1.05);
}
</style>
