---
layout:     post
title:      "leetcode 链表题整理"
date:       2026-01-17
categories: 算法竞赛
---

### [lc23. 合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/)

给你一个链表数组，每个链表都已经按升序排列，将所有链表合并到一个升序链表中，返回合并后的链表。

思路就是用堆维护，归并。也可以分治，两两合并，合并 $O(\log n)$ 轮每轮 $O(n)$

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */

 // m个链表，总共 n 个元素，nlog(m)
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        if (lists.empty()) {
            return nullptr;
        }
        ListNode *res = nullptr, *cur = nullptr;
        using Node = std::pair<int, ListNode*>;
        std::priority_queue<Node, std::vector<Node>, std::greater<>> heap;
        for (const auto &it : lists) {
            if (it != nullptr) {
                heap.push({it->val, it});
            }
        }
        while (!heap.empty()) {
            auto [val, ptr] = heap.top();
            heap.pop();
            if (res == nullptr) {
                res = new ListNode(val);
                cur = res;
            } else {
                cur->next = new ListNode(val);
                cur = cur->next;
            }
            ptr = ptr->next;
            if (ptr != nullptr) {
                heap.push({ptr->val, ptr});
            }
        }
        return res;
    }
};
```

### [lc141. 环形链表](https://leetcode.cn/problems/linked-list-cycle)


给链表判断是否有环，要求 $O(1)$ 空间。

思路是如果能走到 nullptr 肯定无环，如果链表长度为 $n$ 且有环则必能在 $n$ 步内访问相同节点。倍增枚举步数 $k$ 内能否走回当前点。

也可以使用快慢指针。