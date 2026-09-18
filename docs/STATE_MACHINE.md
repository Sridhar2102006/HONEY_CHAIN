# HoneyTrace Lifecycle State Machine & Conservation Invariants

## 1. Honey Batch Lifecycle State Machine

The honey traceability lifecycle is modeled as an immutable, forward-only finite state machine (FSM). The backend enforces these transition invariants authoritative on the database, regardless of client state.

```
       [ 1: HARVESTED ]
              │
              ▼  (Assigned Processor starts cold extraction)
  [ 2: PROCESSING_STARTED ]
              │
              ▼  (Processor completes extraction & specifies method)
   [ 3: PROCESSING_DONE ]
              │
              ▼  (Processor dispatches sample to accredited lab)
    [ 4: LAB_REQUESTED ]
              │
              ▼  (Laboratory completes purity & sugar analysis)
  [ 5: QUALITY_VERIFIED ]
              │
              ▼  (Authorized lab/KVIC issues AGMARK certificate)
       [ 6: CERTIFIED ]
```

---

## 2. Transition Rules & Preconditions

| Transition | From Stage | To Stage | Authorized Roles | Required Preconditions | State Invariants Enforced |
|:---:|:---:|:---:|---|---|---|
| **T1** | 0 (New) | 1 (Harvested) | `beekeeper`, `kvic`, `admin` | Hive ID exists and belongs to beekeeper; positive quantity (`> 0`); harvest date not in future. | Batch created; initial quantity locked to baseline harvest volume. |
| **T2** | 1 | 2 (Processing Started) | `processor`, `kvic`, `admin` | Batch must be assigned to caller's processor ID; batch is in Stage 1. | Processing status marked 'In-Progress'; quantity becomes immutable to beekeeper. |
| **T3** | 2 | 3 (Processing Done) | `processor`, `kvic`, `admin` | Processing method specified (e.g. 'Cold Extraction'); batch is in Stage 2. | Processing status marked 'Completed'; ready for lab testing or portioning. |
| **T4** | 3 | 4 (Lab Requested) | `processor`, `kvic`, `admin` | Batch in Stage 3; accredited laboratory ID specified; sample quantity > 0. | Test status initialized to 'PENDING'; lab notified. |
| **T5** | 4 | 5 (Quality Verified) | `laboratory`, `verifier`, `kvic`, `admin` | Batch in Stage 4; chemical metrics recorded (moisture, sucrose, fructose, glucose); status PASS or FAIL. | Batch stage advances to 5; metrics stored in `quality_results`. |
| **T6** | 5 | 6 (Certified) | `laboratory`, `verifier`, `kvic`, `admin` | Batch in Stage 5; test status === 'PASS'; official certificate ID generated. | Certificate stored; batch marked 'CERTIFIED'; QR verification enabled. |

### Forbidden Transitions
- **Backward Transitions (Regression):** e.g., Stage 6 -> Stage 1, Stage 5 -> Stage 2. Any attempt to decrease `stage` returns `HTTP 400 Bad Request`.
- **Skipped Transitions:** e.g., Stage 1 -> Stage 4, Stage 2 -> Stage 6. Any attempt to advance non-sequentially returns `HTTP 400 Bad Request`.

---

## 3. Physical Quantity Conservation Invariants

### 1. Quantity Locking
- Once a batch enters Stage 2 (`PROCESSING_STARTED`), its primary volume cannot be arbitrarily increased or decreased via `PATCH /api/v1/batches/:batchId`.

### 2. Batch Splitting Conservation of Mass
- When portioning a bulk honey batch into retail units (`POST /api/v1/batches/:batchId/split`):
  $$\sum_{i=1}^{N} \text{child\_quantity}_i \le \text{parent\_quantity}$$
- Every child quantity must be strictly positive: $\text{child\_quantity}_i > 0$.
- A batch can only be split if it has reached Stage 3 (`PROCESSING_DONE`) or Stage 6 (`CERTIFIED`).
- The sum of portioned child batches can never exceed the parent quantity. No "phantom mass" can be created.
