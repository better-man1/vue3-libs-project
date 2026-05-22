<template>
  <div class="p5-demo-container">
    <el-breadcrumb separator="/" class="mb-4">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>工程进阶</el-breadcrumb-item>
      <el-breadcrumb-item>TanStack Vue Query</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-desc">
      <h2>TanStack Vue Query — 服务端状态管理</h2>
      <p>解决 Axios 无法优雅处理的复杂异步状态：自动缓存、后台静默刷新、乐观更新、无限滚动分页。</p>
    </div>

    <!-- Comparison card -->
    <el-alert type="info" :closable="false" class="mb-4">
      <template #default>
        <strong>核心理念区分：</strong>
        Pinia / Vuex 管理的是<em>客户端状态</em>（UI 状态、用户偏好），而 Vue Query 管理的是<em>服务端状态</em>（API 数据），两者互补而不替代。
      </template>
    </el-alert>

    <el-row :gutter="20">
      <!-- Section 1: useQuery -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="① useQuery — 自动缓存数据获取"
          description="首次请求后数据被缓存。切换标签再回来，旧数据立即展示（无闪烁），后台静默刷新。"
          :code="useQueryCode"
        >
          <div class="query-controls flex gap-2 mb-3 flex-wrap">
            <el-button @click="refetchPosts" :loading="postsQuery.isFetching.value" size="small">
              🔄 手动强制刷新
            </el-button>
            <el-tag :type="postsQuery.isStale.value ? 'warning' : 'success'" size="small">
              缓存状态: {{ postsQuery.isStale.value ? '已过期 (Stale)' : '新鲜 (Fresh)' }}
            </el-tag>
            <el-tag type="info" size="small">
              请求次数: {{ fetchCount }}
            </el-tag>
          </div>

          <!-- Loading skeleton -->
          <div v-if="postsQuery.isLoading.value" class="skeleton-list">
            <el-skeleton :rows="3" animated v-for="i in 3" :key="i" class="mb-3" />
          </div>

          <!-- Error state -->
          <el-result
            v-else-if="postsQuery.isError.value"
            icon="error"
            title="请求失败"
            :sub-title="String(postsQuery.error.value)"
          />

          <!-- Success data -->
          <div v-else class="posts-list">
            <div
              v-for="post in postsQuery.data.value?.slice(0, 5)"
              :key="post.id"
              class="post-item"
            >
              <span class="post-id">#{{ post.id }}</span>
              <div class="post-body">
                <p class="post-title">{{ post.title }}</p>
                <p class="post-desc">{{ post.body?.slice(0, 60) }}...</p>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Section 2: useMutation -->
      <el-col :xs="24" :lg="12">
        <DemoCard
          title="② useMutation — 乐观更新写入操作"
          description="点击添加帖子，新帖子立即乐观显示在列表中（无需等待服务器响应），失败后自动回滚。"
          :code="useMutationCode"
        >
          <el-form :model="newPost" class="mb-4" size="small">
            <el-form-item label="标题">
              <el-input v-model="newPost.title" placeholder="输入新帖子标题..." />
            </el-form-item>
            <el-form-item label="内容">
              <el-input v-model="newPost.body" type="textarea" :rows="2" placeholder="输入内容..." />
            </el-form-item>
            <el-button
              type="primary"
              :loading="createMutation.isPending.value"
              @click="handleCreatePost"
              class="w-full"
            >
              {{ createMutation.isPending.value ? '提交中...' : '✅ 乐观创建帖子' }}
            </el-button>
          </el-form>

          <div class="optimistic-list">
            <div
              v-for="item in optimisticPosts"
              :key="item.id"
              class="post-item"
              :class="{ 'optimistic': item.optimistic }"
            >
              <span class="post-id" :class="{ 'pending': item.optimistic }">
                {{ item.optimistic ? '⏳' : `#${item.id}` }}
              </span>
              <div class="post-body">
                <p class="post-title">{{ item.title }}</p>
                <el-tag v-if="item.optimistic" type="warning" size="small">乐观占位中...</el-tag>
              </div>
            </div>
          </div>
        </DemoCard>
      </el-col>

      <!-- Section 3: useInfiniteQuery -->
      <el-col :xs="24">
        <DemoCard
          title="③ useInfiniteQuery — 无限滚动分页"
          description="每页加载 5 条，点击「加载更多」时自动获取下一页数据并追加，无需手动管理 page 状态。"
          :code="infiniteQueryCode"
        >
          <div class="infinite-list">
            <template v-if="commentsQuery.data.value">
              <template v-for="page in commentsQuery.data.value.pages" :key="page">
                <div
                  v-for="comment in page"
                  :key="comment.id"
                  class="comment-item"
                >
                  <span class="comment-email">{{ comment.email }}</span>
                  <p class="comment-body">{{ comment.body?.slice(0, 80) }}...</p>
                </div>
              </template>
            </template>

            <div class="load-more-area flex justify-center py-3">
              <el-button
                v-if="commentsQuery.hasNextPage.value"
                :loading="commentsQuery.isFetchingNextPage.value"
                @click="commentsQuery.fetchNextPage()"
                type="primary"
                plain
              >
                {{ commentsQuery.isFetchingNextPage.value ? '加载中...' : '⬇️ 加载下一页' }}
              </el-button>
              <el-tag v-else type="info">已加载全部数据</el-tag>
            </div>
          </div>
        </DemoCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/vue-query'
import { ElMessage } from 'element-plus'
import DemoCard from '@/components/common/DemoCard.vue'

// ─── Mock fetch functions ────────────────────────────────────────────
const fetchCount = ref(0)

const fetchPosts = async () => {
  fetchCount.value++
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  if (!res.ok) throw new Error('网络请求失败')
  return res.json()
}

const fetchCommentPage = async ({ pageParam = 1 }) => {
  const start = (pageParam - 1) * 5
  const res = await fetch(`https://jsonplaceholder.typicode.com/comments?_start=${start}&_limit=5`)
  return res.json()
}

const createPost = async (post: { title: string; body: string }) => {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...post, userId: 1 })
  })
  return res.json()
}

// ─── useQuery ────────────────────────────────────────────────────────
const postsQuery = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 30_000, // 30s fresh window
})

const refetchPosts = () => postsQuery.refetch()

// ─── useMutation with optimistic update ──────────────────────────────
const queryClient = useQueryClient()
const newPost = ref({ title: '新的技术博客文章', body: '这里是文章内容，探讨 TanStack Query 的核心用法...' })
const pendingPosts = ref<any[]>([])

const createMutation = useMutation({
  mutationFn: createPost,
  onMutate: async (vars) => {
    // Optimistically add the new post
    const tempId = `temp-${Date.now()}`
    pendingPosts.value.push({ id: tempId, title: vars.title, optimistic: true })
    return { tempId }
  },
  onSuccess: (data, _vars, ctx) => {
    // Replace optimistic item with real item
    const idx = pendingPosts.value.findIndex((p: any) => p.id === ctx?.tempId)
    if (idx !== -1) {
      pendingPosts.value[idx] = { id: data.id, title: data.title, optimistic: false }
    }
    ElMessage.success(`帖子 #${data.id} 创建成功！`)
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  },
  onError: (_err, _vars, ctx) => {
    // Roll back optimistic update
    pendingPosts.value = pendingPosts.value.filter((p: any) => p.id !== ctx?.tempId)
    ElMessage.error('创建失败，已回滚乐观更新！')
  }
})

const optimisticPosts = computed(() => [
  ...(postsQuery.data.value?.slice(0, 3) ?? []),
  ...pendingPosts.value
])

const handleCreatePost = () => {
  if (!newPost.value.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  createMutation.mutate({ title: newPost.value.title, body: newPost.value.body })
}

// ─── useInfiniteQuery ────────────────────────────────────────────────
const commentsQuery = useInfiniteQuery({
  queryKey: ['comments-infinite'],
  queryFn: fetchCommentPage,
  initialPageParam: 1,
  getNextPageParam: (_lastPage: any, allPages: any[]) => {
    return allPages.length < 5 ? allPages.length + 1 : undefined
  }
})

// ─── Code samples ────────────────────────────────────────────────────
const useQueryCode = `// 注册 QueryPlugin 到 Vue App
import { VueQueryPlugin } from '@tanstack/vue-query'
app.use(VueQueryPlugin)

// 组件中使用 useQuery
const postsQuery = useQuery({
  queryKey: ['posts'],         // 缓存 Key
  queryFn: () => fetch('/api/posts').then(r => r.json()),
  staleTime: 30_000,           // 30秒内不重新请求
})

// 模板中直接消费响应式状态
// postsQuery.isLoading / isError / data`

const useMutationCode = `const mutation = useMutation({
  mutationFn: (newPost) => fetch('/api/posts', {
    method: 'POST', body: JSON.stringify(newPost)
  }).then(r => r.json()),
  onMutate: async (vars) => {
    // 乐观更新：立即修改 UI
    queryClient.setQueryData(['posts'], old => [vars, ...old])
  },
  onError: (_err, _vars, ctx) => {
    // 失败时回滚
    queryClient.setQueryData(['posts'], ctx.previousPosts)
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
})`

const infiniteQueryCode = `const infiniteQuery = useInfiniteQuery({
  queryKey: ['comments'],
  queryFn: ({ pageParam = 1 }) =>
    fetch(\`/api/comments?page=\${pageParam}\`).then(r => r.json()),
  initialPageParam: 1,
  // 返回 undefined 时表示没有更多数据
  getNextPageParam: (lastPage, allPages) =>
    lastPage.length > 0 ? allPages.length + 1 : undefined,
})

// 触发下一页加载
infiniteQuery.fetchNextPage()`
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.p5-demo-container { padding-bottom: 24px; }

.post-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child { border-bottom: none; }
  &.optimistic { opacity: 0.7; background: rgba(250, 200, 50, 0.05); border-radius: 6px; padding: 10px; }

  .post-id {
    font-size: 0.75rem;
    font-family: monospace;
    color: var(--text-secondary);
    min-width: 32px;
    padding-top: 3px;
    &.pending { color: #f59e0b; }
  }

  .post-title {
    font-weight: 600;
    font-size: 0.88rem;
    color: var(--text-primary);
    margin: 0 0 4px 0;
    text-transform: capitalize;
  }

  .post-desc {
    font-size: 0.78rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }
}

.comment-item {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-color);
  
  .comment-email {
    font-size: 0.78rem;
    font-weight: 600;
    color: $primary-color;
    display: block;
    margin-bottom: 4px;
  }
  
  .comment-body {
    font-size: 0.82rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }
}

.skeleton-list { padding: 8px 0; }
.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.gap-2 { gap: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.w-full { width: 100%; }
.py-3 { padding: 12px 0; }
.justify-center { justify-content: center; }
</style>
