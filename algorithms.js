// ============================================================
// algorithms.js — BFS & DFS (mirrors algorithms.cpp logic)
// Uses same data structures: Queue (array+shift) = std::queue
//                            Stack (array+pop)   = std::stack
// ============================================================

/**
 * BFS — Breadth First Search
 * Returns full traversal order AND parent map for path tracing
 */
function bfs(start, graph, totalNodes) {
  const visited = new Array(totalNodes).fill(false);
  const parent  = new Array(totalNodes).fill(-1);
  const order   = [];
  const queue   = [];   // std::queue equivalent

  visited[start] = true;
  queue.push(start);

  while (queue.length > 0) {
    const u = queue.shift();   // front + pop
    order.push(u);

    for (const v of (graph[u] || [])) {
      if (!visited[v]) {
        visited[v]  = true;
        parent[v]   = u;
        queue.push(v);
      }
    }
  }
  return { order, parent };
}

/**
 * DFS — Depth First Search (iterative)
 * Returns full traversal order AND parent map for path tracing
 */
function dfs(start, graph, totalNodes) {
  const visited = new Array(totalNodes).fill(false);
  const parent  = new Array(totalNodes).fill(-1);
  const order   = [];
  const stack   = [];   // std::stack equivalent

  stack.push(start);

  while (stack.length > 0) {
    const u = stack.pop();   // top + pop

    if (!visited[u]) {
      visited[u] = true;
      order.push(u);

      const neighbors = graph[u] || [];
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const v = neighbors[i];
        if (!visited[v]) {
          parent[v] = u;
          stack.push(v);
        }
      }
    }
  }
  return { order, parent };
}

/**
 * Reconstruct path from start to end using parent array
 */
function getPath(end, parent) {
  const path = [];
  let cur = end;
  while (cur !== -1) {
    path.unshift(cur);
    cur = parent[cur];
  }
  return path;
}
