<template>
  <div class="dashboard">
    <div class="welcome-block">
      <h1>Добро пожаловать, {{ fullName }}!</h1>

      <p class="subtitle">
        {{
          isAdmin
            ? 'Панель администратора'
            : isDirector
              ? 'Панель руководителя'
              : 'Панель менеджера по персоналу'
        }}
      </p>
    </div>

    <template v-if="isAdmin">
      <div class="stats-grid admin-stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ organizationsCount }}</div>
          <div class="stat-label">Организаций</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ departmentsCount }}</div>
          <div class="stat-label">Отделов</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ employeesCount }}</div>
          <div class="stat-label">Сотрудников</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ positionsCount }}</div>
          <div class="stat-label">Должностей</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ operationsCount }}</div>
          <div class="stat-label">Кадровых операций</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ usersCount }}</div>
          <div class="stat-label">Пользователей</div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>Последние изменения</h2>
          <router-link
            to="/change-history"
            class="section-link"
            title="Перейти к истории изменений"
          >
            <Icon icon="mdi:arrow-right" width="26" />
          </router-link>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Поле</th>
              <th>Дата</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in lastChanges" :key="row.id_change_history">
              <td>{{ row.userName }}</td>
              <td>{{ row.field_name || '-' }}</td>
              <td>{{ formatDate(row.changed_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="charts-grid">
        <div class="section">
          <h2>Распределение сотрудников</h2>

          <div class="chart-wrapper small-chart">
            <Doughnut :data="employeesChartData" :options="chartOptions" />
          </div>
        </div>

        <div class="section">
          <h2>Кадровые операции за 7 дней</h2>

          <div class="chart-wrapper">
            <Bar :data="operationsChartData" :options="barOptions" />
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="isHr">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">
            {{ activeEmployees }}
          </div>
          <div class="stat-label">Работают</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">
            {{ applicants }}
          </div>
          <div class="stat-label">Соискатели</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">
            {{ dismissed }}
          </div>
          <div class="stat-label">Уволенные</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">
            {{ pendingOperations }}
          </div>
          <div class="stat-label">На рассмотрении</div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>Последние кадровые операции</h2>
          <router-link to="/hrOperations" class="section-link" title="Перейти к кадровым операциям">
            <Icon icon="mdi:arrow-right" width="26" />
          </router-link>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Сотрудник</th>
              <th>Организация</th>
              <th>Отдел</th>
              <th>Должность</th>
              <th>Зарплата</th>
              <th>Статус сотрудника</th>
              <th>Статус операции</th>
              <th>Последнее изменение</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in latestOperations" :key="row.id_hr_operation">
              <td>{{ row.employee_name }}</td>
              <td>{{ row.organization_name }}</td>
              <td>{{ row.department_name }}</td>
              <td>{{ row.position_name }}</td>
              <td>
                {{
                  new Intl.NumberFormat('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                  }).format(row.salary)
                }}
              </td>
              <td>{{ getStatus(row.active_status) }}</td>
              <td>
                <span>{{ getApprovalStatus(row.approval_status) }}</span>
                <em
                  v-if="row.approval_status === 'rejected' && row.reject_reason"
                  class="reject-inline"
                >
                  ({{ row.reject_reason }})
                </em>
              </td>
              <td>{{ formatDate(row.updated_at || row.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Отделы с наибольшим количеством кадровых операций</h2>
        <div class="chart-wrapper">
          <Bar :data="departmentOperationsChartData" :options="horizontalBarOptions" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">
            {{ pendingOperations }}
          </div>
          <div class="stat-label">Ожидают решения</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">
            {{ approvedOperations }}
          </div>
          <div class="stat-label">Одобрено</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">
            {{ rejectedOperations }}
          </div>
          <div class="stat-label">Отклонено</div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>Последние кадровые заявки</h2>
          <router-link to="/hrOperations" class="section-link" title="Перейти к кадровым операциям">
            <Icon icon="mdi:arrow-right" width="26" />
          </router-link>
        </div>

        <div v-if="directorPending.length" class="director-grid">
          <div
            v-for="row in directorPending"
            :key="row.id_hr_operation"
            class="director-operation-card"
          >
            <div class="director-card-name">
              {{ row.employee_name }}
            </div>

            <div class="director-card-change">
              <template v-if="row.active_status === 'applicant'">
                <span class="applicant"> Соискатель </span>
              </template>
              <template v-else>
                Изменено:
                {{ getChangedFieldsText(row.id_hr_operation) }}
              </template>
            </div>

            <div class="director-card-date">
              {{ formatDate(row.updated_at || row.created_at) }}
            </div>
          </div>
        </div>
        <div v-else class="empty-director">Нет операций, ожидающих решения</div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2>Динамика согласований за последние 7 дней</h2>
        </div>

        <div class="chart-wrapper">
          <Line :data="approvalsChartData" :options="approvalsChartOptions" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import { useAuth } from '@/composables/useAuth'
import { useOrganizations } from '@/composables/useOrganizations'
import { useDepartments } from '@/composables/useDepartments'
import { useEmployees } from '@/composables/useEmployees'
import { useUsers } from '@/composables/useUsers'
import { useHrOperations } from '@/composables/useHrOperations'
import { useChangeHistory } from '@/composables/useChangeHistory'
import { usePositions } from '@/composables/usePositions'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
)

const { currentUser, isAdmin } = useAuth()
const isDirector = computed(() => currentUser.value?.id_role === 3)
const isHr = computed(() => currentUser.value?.id_role === 2)

const fullName = computed(() => {
  if (!currentUser.value) {
    return ''
  }
  return [currentUser.value.last_name, currentUser.value.first_name, currentUser.value.middle_name]
    .filter(Boolean)
    .join(' ')
})

const { actualList: organizations, loadOrganizations } = useOrganizations()
const { actualList: departments, loadDepartments } = useDepartments()
const { actualList: employees, loadEmployees } = useEmployees()
const { actualList: users, loadUsers: loadSystemUsers } = useUsers()
const { actualList: operations, reloadAll: loadOperations, getChangedFields } = useHrOperations()
const { historyList: history, loadHistory, loadUsers: loadHistoryUsers } = useChangeHistory()
const { actualList: positions, loadPositions } = usePositions()
const adminPromises = isAdmin.value ? [loadSystemUsers(), loadHistoryUsers()] : []

onMounted(async () => {
  await Promise.all([
    loadOrganizations(),
    loadDepartments(),
    loadEmployees(),
    loadOperations(),
    loadHistory(),
    loadPositions(),

    ...adminPromises,
  ])
})

const organizationsCount = computed(() => organizations.value.length)
const departmentsCount = computed(() => departments.value.length)
const employeesCount = computed(() => employees.value.length)
const usersCount = computed(() => users.value.length)
const positionsCount = computed(() => positions.value.length)
const operationsCount = computed(() => operations.value.length)

const activeEmployees = computed(
  () =>
    operations.value.filter(
      (o) =>
        !o.deleted_at &&
        o.active_status !== 'applicant' &&
        !(o.active_status === 'dismissed' && o.approval_status === 'approved'),
    ).length,
)

const applicants = computed(
  () =>
    operations.value.filter(
      (o) => o.active_status === 'applicant' && o.approval_status === 'pending',
    ).length,
)

const dismissed = computed(
  () =>
    operations.value.filter(
      (o) => o.active_status === 'dismissed' && o.approval_status === 'approved',
    ).length,
)

const pendingOperations = computed(
  () => operations.value.filter((o) => o.approval_status === 'pending').length,
)

const approvedOperations = computed(
  () => operations.value.filter((o) => o.approval_status === 'approved').length,
)

const rejectedOperations = computed(
  () => operations.value.filter((o) => o.approval_status === 'rejected').length,
)

const latestOperations = computed(() =>
  [...operations.value]
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at).getTime() -
        new Date(a.updated_at || a.created_at).getTime(),
    )
    .slice(0, 5),
)

const lastChanges = computed(() =>
  [...history.value]
    .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
    .slice(0, 5),
)

const directorPending = computed(() =>
  operations.value
    .filter((o) => o.approval_status === 'pending')
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at).getTime() -
        new Date(a.updated_at || a.created_at).getTime(),
    )
    .slice(0, 6),
)

const approvalsChartData = computed(() => {
  const labels: string[] = []
  const approvedData: number[] = []
  const rejectedData: number[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const label = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    })
    labels.push(label)

    const approvedCount = operations.value.filter((o) => {
      if (o.approval_status !== 'approved') {
        return false
      }
      const operationDate = new Date(o.updated_at || o.created_at)
      return operationDate.toDateString() === date.toDateString()
    }).length

    const rejectedCount = operations.value.filter((o) => {
      if (o.approval_status !== 'rejected') {
        return false
      }
      const operationDate = new Date(o.updated_at || o.created_at)
      return operationDate.toDateString() === date.toDateString()
    }).length
    approvedData.push(approvedCount)
    rejectedData.push(rejectedCount)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Одобрено',
        data: approvedData,
        borderColor: '#1B2234',
        backgroundColor: '#1B2234',
        tension: 0.3,
      },
      {
        label: 'Отклонено',
        data: rejectedData,
        borderColor: '#A49B95',
        backgroundColor: '#A49B95',
        tension: 0.3,
      },
    ],
  }
})

const approvalsChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          size: 14,
        },
      },
    },
    tooltip: {
      bodyFont: {
        size: 14,
      },
      titleFont: {
        size: 14,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 13,
        },
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        font: {
          size: 13,
        },
      },
    },
  },
}

const employeesChartData = computed(() => ({
  labels: ['Работают', 'Соискатели', 'Уволенные'],
  datasets: [
    {
      data: [activeEmployees.value, applicants.value, dismissed.value],
      backgroundColor: ['#1B2234', '#D4A017', '#A49B95'],
      borderWidth: 1,
    },
  ],
}))

const operationsChartData = computed(() => {
  const labels: string[] = []
  const data: number[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(
      date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      }),
    )
    const count = operations.value.filter((o) => {
      const d = new Date(o.created_at)
      return d.toDateString() === date.toDateString()
    }).length
    data.push(count)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Кадровые операции',
        data,
        backgroundColor: '#1B2234',
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        font: {
          size: 15,
        },
      },
    },
    tooltip: {
      bodyFont: {
        size: 14,
      },
      titleFont: {
        size: 14,
      },
    },
  },
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      bodyFont: {
        size: 14,
      },
      titleFont: {
        size: 14,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 13,
        },
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        font: {
          size: 13,
        },
      },
    },
  },
}

const departmentOperationsChartData = computed(() => {
  const departmentMap = new Map<string, number>()
  operations.value.forEach((o) => {
    const dep = o.department_name || 'Без отдела'
    departmentMap.set(dep, (departmentMap.get(dep) || 0) + 1)
  })
  const sorted = [...departmentMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  return {
    labels: sorted.map(([name]) => name),
    datasets: [
      {
        label: 'Кадровые операции',
        data: sorted.map(([, count]) => count),
        backgroundColor: '#1B2234',
      },
    ],
  }
})

const horizontalBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      bodyFont: {
        size: 14,
      },
      titleFont: {
        size: 14,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        font: {
          size: 13,
        },
      },
    },
    y: {
      ticks: {
        font: {
          size: 13,
        },
      },
    },
  },
}

function formatDate(val: Date | string) {
  return new Date(val).toLocaleString('ru-RU')
}

function getStatus(status: string) {
  if (status === 'active') return 'Работает'
  if (status === 'dismissed') return 'Уволен'
  return 'Соискатель'
}

function getApprovalStatus(status: string) {
  if (status === 'approved') {
    return 'Одобрено'
  }
  if (status === 'pending') {
    return 'На рассмотрении'
  }
  return 'Отклонено'
}

function getChangedFieldsText(id: number) {
  const fields = getChangedFields(id)
  const map: Record<string, string> = {
    id_department: 'Отдел',
    id_position: 'Должность',
    salary: 'Зарплата',
    active_status: 'Статус сотрудника',
  }
  const labels = [...fields].map((f) => map[f] || f)
  if (!labels.length) {
    return 'Данные сотрудника'
  }
  return labels.join(', ')
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-block h1 {
  font-size: 32px;
  margin-bottom: 6px;
}

.subtitle {
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.admin-stats-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  border: 3px solid #000;
  border-radius: 10px;
  padding: 20px;
  background: #fff;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
}

.stat-label {
  margin-top: 10px;
  color: #555;
}

.section {
  border: 3px solid #000;
  border-radius: 10px;
  padding: 20px;
  background: white;
}

.section h2 {
  margin-bottom: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border-bottom: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header h2 {
  margin-bottom: 0;
}

.section-link {
  width: 46px;
  height: 46px;
  border: 2px solid #000;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #000;
  transition: 0.2s;
  flex-shrink: 0;
}

.section-link svg {
  display: block;
}

.section-link:hover {
  background: #000;
  color: #fff;
}

.reject-inline {
  color: #666;
  margin-left: 4px;
  font-size: 12px;
}

.director-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.director-operation-card {
  border: 2px solid #000;
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fff;
  min-height: 140px;
}

.director-card-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.director-card-change {
  font-size: 15px;
  line-height: 1.4;
}

.director-card-row span:first-child {
  font-weight: bold;
  white-space: nowrap;
}

.director-card-date {
  margin-top: 6px;
  font-size: 12px;
  color: #666;
}

.applicant {
  color: #c99700;
  font-weight: bold;
}

.empty-director {
  color: #666;
  font-style: italic;
}

.chart-wrapper {
  height: 340px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-width: 0;
}

.charts-grid > .section {
  min-width: 0;
}

.small-chart {
  max-width: 320px;
  margin: 0 auto;
}
</style>
