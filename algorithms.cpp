// ============================================================
// BFS & DFS Algorithm Implementation in C++
// This is the reference C++ source. The same logic is
// mirrored in algorithms.js for direct browser execution.
// To compile: g++ -std=c++17 algorithms.cpp -o algorithms
// ============================================================

#include <iostream>
#include <vector>
#include <queue>
#include <stack>
#include <unordered_map>
#include <string>

using namespace std;

// Graph represented as adjacency list
unordered_map<int, vector<int>> graph;

// BFS - Breadth First Search
vector<int> bfs(int start, int totalNodes) {
    vector<bool> visited(totalNodes, false);
    vector<int> order;
    queue<int> q;

    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int node = q.front();
        q.pop();
        order.push_back(node);

        for (int neighbor : graph[node]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
    return order;
}

// DFS - Depth First Search (iterative)
vector<int> dfs(int start, int totalNodes) {
    vector<bool> visited(totalNodes, false);
    vector<int> order;
    stack<int> s;

    s.push(start);

    while (!s.empty()) {
        int node = s.top();
        s.pop();

        if (!visited[node]) {
            visited[node] = true;
            order.push_back(node);

            // Push neighbors in reverse for left-to-right traversal
            for (int i = graph[node].size() - 1; i >= 0; i--) {
                if (!visited[graph[node][i]]) {
                    s.push(graph[node][i]);
                }
            }
        }
    }
    return order;
}

int main() {
    // Example: Algorithm Learning Roadmap graph
    graph[0] = {1, 2};       // Start -> Arrays, Strings
    graph[1] = {3, 4};       // Arrays -> Sorting, Searching
    graph[2] = {4, 5};       // Strings -> Searching, Hashing
    graph[3] = {6};           // Sorting -> Trees
    graph[4] = {6, 7};       // Searching -> Trees, Graphs
    graph[5] = {7};           // Hashing -> Graphs
    graph[6] = {8};           // Trees -> Dynamic Programming
    graph[7] = {8};           // Graphs -> Dynamic Programming
    graph[8] = {};             // Dynamic Programming (end)

    cout << "BFS Order: ";
    for (int n : bfs(0, 9)) cout << n << " ";
    cout << endl;

    cout << "DFS Order: ";
    for (int n : dfs(0, 9)) cout << n << " ";
    cout << endl;

    return 0;
}
