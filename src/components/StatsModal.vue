<template>
  <el-dialog
    :model-value="visible"
    title="专注数据统计"
    width="700px"
    center
    :before-close="handleClose"
    class="stats-dialog"
    @opened="initChart"
  >
    <div class="stats-overview">
      <div class="stat-card">
        <div class="label">累计专注</div>
        <div class="value">
          {{ totalMinutes }} <span class="unit">分钟</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="label">今日专注</div>
        <div class="value">
          {{ todayMinutes }} <span class="unit">分钟</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="label">专注次数</div>
        <div class="value">
          {{ totalSessions }} <span class="unit">次</span>
        </div>
      </div>
    </div>

    <div ref="chartRef" class="chart-container"></div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue"; // 🔥 已移除 watch
import * as echarts from "echarts";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(["update:visible"]);

const HISTORY_KEY = "flow-focus-history";
const chartRef = ref<HTMLElement | null>(null);
let myChart: echarts.ECharts | null = null;

const historyData = ref<any[]>([]);

const totalMinutes = computed(() =>
  historyData.value.reduce((acc, cur) => acc + cur.minutes, 0)
);
const totalSessions = computed(() => historyData.value.length);
const todayMinutes = computed(() => {
  const today = new Date().toISOString().split("T")[0];
  return historyData.value
    .filter((item) => item.date === today)
    .reduce((acc, cur) => acc + cur.minutes, 0);
});

const loadData = () => {
  const saved = localStorage.getItem(HISTORY_KEY);
  if (saved) {
    historyData.value = JSON.parse(saved);
  }
};

const handleClose = () => {
  emit("update:visible", false);
};

const initChart = async () => {
  loadData();
  await nextTick();
  if (!chartRef.value) return;

  if (myChart) myChart.dispose();
  myChart = echarts.init(chartRef.value);

  const dates = [];
  const minutes = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const monthDay = `${d.getMonth() + 1}/${d.getDate()}`;

    dates.push(monthDay);

    const dayTotal = historyData.value
      .filter((item) => item.date === dateStr)
      .reduce((acc, cur) => acc + cur.minutes, 0);
    minutes.push(dayTotal);
  }

  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue("--text-color").trim() || "#fff";
  const accentColor =
    styles.getPropertyValue("--accent-color").trim() || "#ffd04b";

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,0.8)",
      borderColor: accentColor,
      textStyle: { color: "#fff" },
    },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: dates,
      axisLine: { lineStyle: { color: textColor } },
      axisLabel: { color: textColor },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
      axisLabel: { color: textColor },
    },
    series: [
      {
        name: "专注时长",
        type: "bar",
        barWidth: "40%",
        data: minutes,
        itemStyle: {
          color: accentColor,
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  myChart.setOption(option);
};

window.addEventListener("resize", () => {
  myChart?.resize();
});
</script>

<style scoped>
.stats-overview {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}
.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--text-color);
  border-radius: 8px;
  padding: 15px;
  width: 30%;
  text-align: center;
}
.stat-card .label {
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 5px;
}
.stat-card .value {
  font-size: 28px;
  font-weight: bold;
  color: var(--accent-color);
}
.stat-card .unit {
  font-size: 12px;
  color: var(--text-color);
}
.chart-container {
  width: 100%;
  height: 300px;
}
</style>

<style>
.el-dialog.stats-dialog {
  background: var(--panel-bg) !important;
  border: var(--panel-border) !important;
  border-radius: var(--border-radius) !important;
  backdrop-filter: blur(10px);
}
.stats-dialog .el-dialog__title {
  color: var(--text-color) !important;
  font-family: inherit;
  font-weight: bold;
}
.stats-dialog .el-dialog__headerbtn .el-dialog__close {
  color: var(--text-color) !important;
}
.stats-dialog .el-dialog__headerbtn .el-dialog__close:hover {
  color: var(--accent-color) !important;
}
</style>
