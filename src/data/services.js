// [id, label, domain, exam sections, service bullets, [[concept, bullets], ...]]
const S = [
  [
    "playbook",
    "Exam Playbook",
    "design",
    ["1.1", "1.2", "1.3", "1.4"],
    [
      'Cross-service **decision patterns**: most questions ask "which service / design best meets requirement X at lowest cost & ops"',
      'Read for **trigger words**: "existing Spark", "global", "sub-10 ms", "no-ops", "minimal downtime", "exfiltration"',
      "Prefer **managed / serverless** answers unless a constraint rules them out",
    ],
    [
      [
        "Storage decision tree",
        [
          "Analytical SQL at scale → **BigQuery**; files / data lake → **Cloud Storage**",
          "Global, strongly consistent OLTP → **Spanner**; regional relational → **Cloud SQL** or **AlloyDB**",
          "High-throughput key lookups / time series → **Bigtable**; documents & mobile → **Firestore**; cache → **Memorystore**",
        ],
      ],
      [
        "Processing choice",
        [
          "New batch or streaming pipeline, serverless → **Dataflow**",
          "Existing **Spark/Hadoop** code → **Dataproc**",
          "SQL transforms inside BigQuery → **Dataform**; GUI / no-code → **Data Fusion**",
          "DB change capture → **Datastream**",
        ],
      ],
      [
        "ACID vs availability",
        [
          "Multi-row **ACID**: Spanner, Cloud SQL, AlloyDB; Firestore has document transactions",
          "**Bigtable**: single-row atomicity only; replicated clusters are **eventually consistent**",
          "**BigQuery**: DML is atomic per statement; **multi-statement transactions** supported",
        ],
      ],
      [
        "DR: RPO & RTO",
        [
          "Define **RPO** (tolerable data loss) and **RTO** (tolerable downtime) first",
          "Zonal → **regional HA** → **cross-region** replicas / backups as RPO/RTO tighten",
          "Examples: GCS **dual-region + turbo replication**, Cloud SQL **cross-region replica**, Spanner **multi-region**, BigQuery **managed DR**",
        ],
      ],
      [
        "Sovereignty & compliance",
        [
          "**Org policy** resource-location constraint keeps data in allowed regions",
          "Regional datasets & buckets; **Assured Workloads** for regulated regimes",
          "Layer **IAM** + **VPC SC** + **CMEK** + **de-identification**",
        ],
      ],
      [
        "Migration planning",
        [
          "Assess → plan → migrate → **validate** → cut over",
          "DBs: **DMS**; warehouses: **BigQuery DTS + Migration Service**; files: **STS / Transfer Appliance**; CDC: **Datastream**",
          "Run old and new **in parallel**; compare row counts & checksums before cutover",
        ],
      ],
      [
        "Portability",
        [
          "Open formats (**Parquet, Iceberg**) and engines (**Beam, Spark, Kafka, Airflow**) reduce lock-in",
          "**BigQuery Omni** queries AWS/Azure data in place",
          "Separate **dev / test / prod** projects for multi-environment design",
        ],
      ],
    ],
  ],
  [
    "pubsub",
    "Pub/Sub",
    "ingest",
    ["2.1", "2.2"],
    [
      "Global, serverless **asynchronous messaging**; decouples producers from consumers; no partitions to manage",
      "Use when: event ingestion, fan-out, streaming into **Dataflow** or **BigQuery**",
      "Avoid when: you must keep the **Kafka API** / ecosystem (→ Managed Kafka) or need a queryable store",
    ],
    [
      [
        "Pull, push & export",
        [
          "**Pull**: high throughput, consumer controls flow (Dataflow uses pull)",
          "**Push**: Pub/Sub POSTs to an HTTPS endpoint (e.g. Cloud Run)",
          "**BigQuery** and **Cloud Storage subscriptions** write directly with no pipeline code",
          "Use when (export subs): no transformation is needed",
        ],
      ],
      [
        "Delivery guarantees",
        [
          "Default **at-least-once** → design **idempotent** consumers",
          "**Exactly-once delivery** available on pull subscriptions (regional)",
          "**Ack deadline** 10 s default, extendable up to **600 s**; unacked → redelivered",
        ],
      ],
      [
        "Ordering keys",
        [
          "Ordered delivery **per ordering key**, enabled on the subscription",
          "Lower per-key throughput; a failed message blocks its key",
          "Pitfall: no **global** ordering across keys",
        ],
      ],
      [
        "Retention & replay",
        [
          "Subscription retention default **7 days**; topic retention up to **31 days**",
          "**Seek** to a timestamp or **snapshot** to replay after a bad deploy",
          "Keep acked messages if you need replay",
        ],
      ],
      [
        "Dead letters & retries",
        [
          "**Dead-letter topic** after N delivery attempts (5–100)",
          "**Retry policy**: immediate or exponential backoff",
          "Watch **oldest_unacked_message_age** and backlog size",
        ],
      ],
      [
        "Schemas & limits",
        [
          "**Schemas** (Avro / Protobuf) validate messages at publish",
          "**Subscription filters** on attributes cut consumer cost",
          "Max message size **10 MB**",
        ],
      ],
    ],
  ],
  [
    "kafka",
    "Managed Kafka",
    "ingest",
    ["2.2"],
    [
      "**Managed Service for Apache Kafka**: managed clusters with the open Kafka API",
      "Use when: existing Kafka producers/consumers, lift-and-shift, **Kafka Connect** ecosystem",
      "Avoid when: greenfield GCP eventing with no Kafka dependency (→ **Pub/Sub**, less ops)",
    ],
    [
      [
        "Kafka vs Pub/Sub",
        [
          "**Kafka**: partitions, offsets, consumer groups, log compaction",
          "**Pub/Sub**: serverless, per-message ack, autoscaling",
          'Trigger: "reuse existing Kafka code" → Managed Kafka',
        ],
      ],
      [
        "Sizing & partitions",
        [
          "Capacity sized in **vCPU & memory**; Google manages brokers",
          "Ordering only **within a partition**; partitions cap consumer parallelism",
        ],
      ],
      [
        "Integrations",
        [
          "Managed **Kafka Connect** for sinks to BigQuery / Cloud Storage",
          "**Dataflow** and **Spark** read Kafka natively",
        ],
      ],
    ],
  ],
  [
    "datastream",
    "Datastream",
    "ingest",
    ["1.4", "2.2"],
    [
      "Serverless **change data capture (CDC)** and replication",
      "Sources: **MySQL, PostgreSQL, Oracle, SQL Server** and more; targets: **BigQuery**, **Cloud Storage**",
      "Use when: near-real-time replication of OLTP data into BigQuery with low source impact",
      "Avoid when: one-time DB-to-DB migration (→ **Database Migration Service**)",
    ],
    [
      [
        "Backfill + CDC",
        [
          "Initial **backfill** of history, then continuous changes",
          "Reads DB logs (**binlog**, **WAL / logical decoding**, **LogMiner**) → low load on source",
        ],
      ],
      [
        "BigQuery target",
        [
          "Writes straight to BigQuery in **merge** (upsert) or **append-only** mode",
          "**max_staleness** trades freshness against query cost",
        ],
      ],
      [
        "Connectivity",
        [
          "**IP allowlist**, **forward SSH tunnel**, or **private connectivity** (VPC peering / PSC)",
          "Private connectivity for on-prem sources over Interconnect / VPN",
        ],
      ],
      [
        "With Dataflow",
        [
          "Datastream → Cloud Storage → **Dataflow template** → BigQuery / Spanner / Cloud SQL",
          "Use when the change stream needs transformation",
        ],
      ],
    ],
  ],
  [
    "sts",
    "Storage Transfer Service",
    "ingest",
    ["1.4", "2.2"],
    [
      "Managed online transfer **into Cloud Storage** from **S3, Azure Blob, HTTP(S), other buckets, on-prem file systems**",
      "Scheduled, incremental, checksummed, with retries",
      "Avoid when: the network is too slow for the volume (→ **Transfer Appliance**)",
    ],
    [
      [
        "On-prem agents",
        [
          "**Transfer agents** (containers) read POSIX / HDFS sources",
          "**Agent pools** scale throughput; bandwidth caps protect links",
        ],
      ],
      [
        "Choosing a tool",
        [
          "Small, ad-hoc (≲ 1 TB): **gcloud storage cp / rsync**",
          "Large, recurring or cloud-to-cloud: **STS**",
          "Huge volume over slow link: **Transfer Appliance**",
        ],
      ],
      [
        "Options",
        [
          "**Event-driven** transfers from S3 / GCS notifications",
          "Delete-at-source, overwrite rules, metadata preservation",
        ],
      ],
    ],
  ],
  [
    "appliance",
    "Transfer Appliance",
    "ingest",
    ["1.4"],
    [
      "Google-shipped **physical device** for **offline** bulk transfer (tens to hundreds of TB)",
      "Data is **encrypted at capture**; Google uploads it to your bucket",
      "Use when: an online transfer would take **more than about a week** or bandwidth is scarce",
    ],
    [
      [
        "Decision math",
        [
          "Time ≈ size ÷ usable bandwidth: **100 TB at 1 Gbps ≈ 9–12 days**",
          "Add shipping & upload time (weeks end to end)",
        ],
      ],
      [
        "Workflow",
        [
          "Order → copy data → ship → Google uploads to Cloud Storage",
          "Then load / process from the bucket as usual",
        ],
      ],
    ],
  ],
  [
    "dts",
    "BigQuery DTS",
    "ingest",
    ["1.4", "2.2"],
    [
      "**BigQuery Data Transfer Service**: scheduled, managed loads **into BigQuery**",
      "Sources: **Google SaaS** (Ads, YouTube…), **S3 / Azure Blob / GCS**, **Redshift**, **Teradata**",
      "Use when: recurring loads with no code, warehouse migration",
    ],
    [
      [
        "Warehouse migration",
        [
          "Teradata / Redshift → BigQuery schema and data",
          "Pair with **BigQuery Migration Service** (assessment, **SQL translation**)",
          "Validate with the **Data Validation Tool**",
        ],
      ],
      [
        "Scheduled queries",
        [
          "Run SQL on a schedule, write results to tables",
          "Simple ELT; for dependencies use **Dataform** or **Composer**",
        ],
      ],
    ],
  ],
  [
    "dms",
    "Database Migration Service",
    "ingest",
    ["1.4"],
    [
      "Serverless migration **into Cloud SQL and AlloyDB** (MySQL, PostgreSQL, SQL Server)",
      "**Continuous** (CDC) migration enables minimal-downtime cutover",
      "Avoid when: ongoing analytics replication into BigQuery (→ **Datastream**)",
    ],
    [
      [
        "Phases",
        [
          "Full dump + CDC → **promote** the replica at cutover",
          "Test in dev; validate counts and checksums",
        ],
      ],
      [
        "Homogeneous vs heterogeneous",
        [
          "**Homogeneous**: same engine, native replication",
          "**Heterogeneous** (e.g. **Oracle → PostgreSQL**): **conversion workspace** for schema & code, Gemini-assisted",
        ],
      ],
    ],
  ],
  [
    "dataflow",
    "Dataflow",
    "process",
    ["1.2", "2.2", "2.3", "5.5"],
    [
      "Serverless **Apache Beam** runner: one model for **batch and streaming**",
      "Autoscaling, dynamic work rebalancing, **exactly-once** streaming by default",
      "Use when: new pipelines, streaming with windows / late data, serverless ETL",
      "Avoid when: existing Spark/Hadoop code (→ **Dataproc**) or pure SQL in BigQuery (→ **Dataform**)",
    ],
    [
      [
        "Beam model",
        [
          "**PCollection**, **PTransform**, **ParDo / DoFn**, **GroupByKey / Combine**",
          "**Side inputs** for small lookup data",
          "Same code for batch and stream",
        ],
      ],
      [
        "Windowing",
        [
          "**Fixed (tumbling)**, **sliding (hopping)**, **session** (gap-based), **global**",
          "Window on **event time**, not processing time",
          "Session windows fit bursts of user activity",
        ],
      ],
      [
        "Watermarks & late data",
        [
          "**Watermark** = estimate of event-time completeness",
          "**Triggers** (early / on-time / late) and **allowed lateness**",
          "Data later than allowed lateness is **dropped** → capture it in a side output",
        ],
      ],
      [
        "Templates & job ops",
        [
          "**Flex Templates**: containerised, parameterised, CI/CD-friendly",
          "**Update** a running job, **Drain** (finish in-flight) or **Cancel** (stop now)",
          "**Snapshots** save streaming state",
        ],
      ],
      [
        "Cost & performance",
        [
          "**Streaming Engine** moves state off workers",
          "**FlexRS**: cheaper batch with delayed start",
          "Fusion can hide parallelism → add **Reshuffle**",
          "**At-least-once mode** is cheaper when duplicates are acceptable",
        ],
      ],
      [
        "Errors & dead letters",
        [
          "Catch bad records → **dead-letter** sink (GCS / BigQuery / Pub/Sub)",
          "Failing work items retry **4× in batch** (then job fails), **indefinitely in streaming** (pipeline stalls)",
        ],
      ],
      [
        "Network & security",
        [
          "Workers on **private IPs** + Private Google Access",
          "Dedicated **worker service account**; **CMEK** for state",
          "Firewall must allow worker ports **12345–12346**",
        ],
      ],
    ],
  ],
  [
    "dataproc",
    "Dataproc",
    "process",
    ["2.2", "5.1"],
    [
      'Now branded **Managed Service for Apache Spark** (clusters + serverless); APIs still say "dataproc"',
      "Managed **Spark, Hadoop, Hive, Trino, Flink**; clusters start in about 90 s",
      "Use when: migrating existing **Spark / Hadoop** jobs, Spark ML, notebooks",
      "Avoid when: greenfield streaming or zero-ops ETL (→ **Dataflow**)",
    ],
    [
      [
        "Ephemeral vs persistent",
        [
          "**Job-scoped** clusters: create → run → delete (cheapest)",
          "**Persistent** clusters only for steady or interactive load",
          "Keep data in **Cloud Storage**, not HDFS, to decouple storage & compute",
          "**Scheduled deletion** on idle",
        ],
      ],
      [
        "Serverless Spark",
        [
          "Submit **batches** or interactive sessions; no cluster sizing",
          "Autoscales; ideal for sporadic Spark jobs",
        ],
      ],
      [
        "Workers & cost",
        [
          "**Secondary workers** on **Spot / preemptible** VMs (no HDFS)",
          "**Autoscaling policies** on YARN metrics",
          "Pitfall: many preemptibles → shuffle failures (use **Enhanced Flexibility Mode**)",
        ],
      ],
      [
        "Config & metastore",
        [
          "**Initialization actions** and custom images",
          "**Dataproc Metastore** / **BigQuery metastore** for shared table metadata",
          "**Component Gateway** for Spark / Jupyter UIs",
        ],
      ],
      [
        "Connectors",
        [
          "**Cloud Storage connector** (gs://) replaces HDFS",
          "**Spark BigQuery connector**",
          "**Bigtable** through the HBase API",
        ],
      ],
    ],
  ],
  [
    "datafusion",
    "Cloud Data Fusion",
    "process",
    ["1.2", "2.2"],
    [
      "Visual, **low-code** ETL / ELT built on **CDAP**; pipelines run on **Dataproc**",
      "Large plugin library and **Wrangler** for interactive data prep",
      "Use when: GUI-driven integration for less code-centric teams",
      "Avoid when: code-first teams or high-scale streaming (→ **Dataflow**)",
    ],
    [
      [
        "Instances",
        [
          "Choose edition by features and SLA; billed per instance hour plus Dataproc",
          "**Private instance** (VPC peering) to reach private / on-prem sources",
        ],
      ],
      [
        "Replication",
        ["**Replication** jobs (CDC) from MySQL / SQL Server / Oracle into BigQuery"],
      ],
      [
        "Lineage & reuse",
        [
          "Built-in **lineage** into Dataplex / Knowledge Catalog",
          "Reusable pipelines with **macros** and triggers",
        ],
      ],
    ],
  ],
  [
    "dataform",
    "Dataform",
    "process",
    ["1.2", "2.2", "5.2"],
    [
      "**SQL-based ELT inside BigQuery** using SQLX (dbt-like)",
      "Dependencies via **ref()** build the DAG automatically; **Git** integration",
      "No extra charge beyond BigQuery compute",
      "Avoid when: transformations outside BigQuery or heavy non-SQL logic",
    ],
    [
      [
        "Assertions",
        [
          "Built-in **data quality assertions** (unique, non-null, row conditions)",
          "Fail the run before bad data propagates",
        ],
      ],
      [
        "Incremental tables",
        [
          "**incremental** tables process only new rows; **uniqueKey** for merges",
          "Less data scanned → lower cost",
        ],
      ],
      [
        "Releases & schedules",
        [
          "**Release configurations** compile per environment (dev / prod variables)",
          "**Workflow configurations** schedule runs, or trigger from **Composer / Workflows**",
        ],
      ],
    ],
  ],
  [
    "composer",
    "Cloud Composer",
    "process",
    ["2.3", "5.2"],
    [
      'Managed **Apache Airflow**; now branded **Managed Service for Apache Airflow** (APIs & IAM still "composer")',
      "Python **DAGs** orchestrate tasks across GCP, on-prem and other clouds",
      "Use when: multi-step dependencies, retries, backfills, cross-service pipelines",
      "Avoid when: a single scheduled call (→ **Cloud Scheduler**) or light API chains (→ **Workflows**)",
    ],
    [
      [
        "DAG design",
        [
          "Tasks **idempotent** and atomic; set **retries** and timeouts",
          "**Catchup / backfill** by logical date",
          "Keep **XCom** small (metadata, not data)",
          "Push heavy work to BigQuery / Dataflow / Dataproc",
        ],
      ],
      [
        "Operators & sensors",
        [
          "Google operators: **BigQueryInsertJobOperator**, Dataflow & Dataproc operators",
          "**Deferrable** operators / sensors free worker slots while waiting",
          "**KubernetesPodOperator** for custom containers",
        ],
      ],
      [
        "Environment & scaling",
        [
          "Composer 3: Google-managed infrastructure; workers **autoscale**",
          "An environment costs money **even when idle**",
          "**Private IP** environments for security",
        ],
      ],
      [
        "DR & lineage",
        [
          "Environment **snapshots** for DR and upgrades",
          "**OpenLineage** events to Knowledge Catalog lineage",
        ],
      ],
    ],
  ],
  [
    "workflows",
    "Workflows",
    "process",
    ["2.3", "5.2"],
    [
      "Serverless **orchestration of HTTP and Google API calls** in YAML / JSON",
      "Pay per step; nothing to run between executions",
      "Use when: chaining Cloud Run, BigQuery jobs, simple low-latency flows",
      "Avoid when: rich Python DAGs, backfills, complex dependency scheduling (→ **Composer**)",
    ],
    [
      [
        "Features",
        [
          "**Retries**, **try / except**, **parallel** branches and loops",
          "**Connectors** poll long-running Google API operations",
          "**Callbacks** wait for external events",
        ],
      ],
      ["Triggers", ["**Cloud Scheduler**, **Eventarc** (e.g. new GCS object) or direct API call"]],
    ],
  ],
  [
    "scheduler",
    "Cloud Scheduler",
    "process",
    ["5.2"],
    [
      "Fully managed **cron**",
      "Targets: **HTTP(S)**, **Pub/Sub**, App Engine; authenticates with a service account",
      "Avoid when: jobs depend on each other (→ **Composer / Workflows**)",
    ],
    [
      [
        "Patterns",
        [
          "Scheduler → **Workflows** or Pub/Sub → function that starts a job",
          "**At-least-once** firing → targets must be idempotent",
        ],
      ],
      [
        "Retries & time",
        [
          "Configurable **retry** with backoff and max attempts",
          "Per-job **time zone** (mind daylight saving)",
        ],
      ],
    ],
  ],
  [
    "gcs",
    "Cloud Storage",
    "store",
    ["3.1", "3.3"],
    [
      "Object storage with **11 nines** durability; data lake landing zone",
      "Locations: **region**, **dual-region**, **multi-region**",
      "Use when: raw / unstructured files, staging, backups, lake storage",
      "Avoid when: record-level random reads and updates (→ a database)",
    ],
    [
      [
        "Storage classes",
        [
          "**Standard**, **Nearline** (30-day min), **Coldline** (90), **Archive** (365)",
          "Colder = cheaper storage but **retrieval fees**",
          "**Autoclass** moves objects by access pattern",
        ],
      ],
      [
        "Lifecycle & retention",
        [
          "**Lifecycle rules**: change class or delete by age / version",
          "**Object Versioning** and **soft delete** guard against deletion",
          "**Retention policy + Bucket Lock** for WORM compliance; **holds** for legal cases",
        ],
      ],
      [
        "Replication & DR",
        [
          "**Dual-region + turbo replication**: **15-minute RPO**",
          "Keep buckets in the **same region** as compute to avoid egress",
        ],
      ],
      [
        "Access control",
        [
          "**Uniform bucket-level access** (IAM only) over ACLs",
          "**Signed URLs** for time-limited access; **public access prevention**",
        ],
      ],
      [
        "Performance & files",
        [
          "Max object size **5 TiB**; parallel composite uploads",
          "Fewer, larger files (~**100 MB–1 GB**) beat many tiny files for analytics",
          "Columnar formats (**Parquet / ORC / Avro**) for lake queries",
        ],
      ],
    ],
  ],
  [
    "bq",
    "BigQuery",
    "store",
    ["3.1", "3.2", "4.1", "5.3"],
    [
      "Serverless **columnar warehouse**; storage and compute scale separately",
      "Pricing: **on-demand** (per TiB scanned) or **capacity** (slots via **Editions**)",
      "Use when: OLAP analytics at scale, SQL, BI, ML",
      "Avoid when: OLTP, high-rate single-row updates, ms point lookups (→ Bigtable / Spanner / Cloud SQL)",
    ],
    [
      [
        "Partitioning",
        [
          "By **time-unit column**, **ingestion time** or **integer range**",
          "Max **10,000 partitions** per table",
          "**require_partition_filter** blocks full scans; **partition expiration** for lifecycle",
        ],
      ],
      [
        "Clustering",
        [
          "Up to **4 columns**; sorted blocks prune scans",
          "Best for high-cardinality filter / aggregate columns; combine with partitioning",
          "Partitions would be tiny → **cluster** instead",
        ],
      ],
      [
        "Editions & slots",
        [
          "**Standard / Enterprise / Enterprise Plus**",
          "**Reservations**: **baseline + autoscaling** slots; **commitments** for discounts",
          "Assign by project / folder; idle slots shared",
          "Separate reservations for **batch vs interactive** / critical workloads",
        ],
      ],
      [
        "Loading & streaming",
        [
          "**Batch loads** are free (shared pool); prefer **Avro / Parquet**",
          "**Storage Write API**: high-throughput streaming, **exactly-once** with committed mode (replaces legacy insertAll)",
          "**Pub/Sub BigQuery subscription** for no-code ingestion; **continuous queries** for real-time SQL",
        ],
      ],
      [
        "Query tuning",
        [
          "No **SELECT ***; **LIMIT** does not cut bytes scanned",
          "Filter on partition / cluster columns; **APPROX_** aggregates",
          "**Dry run** and **maximum bytes billed**; read the **execution plan** for skew",
          "**Nested & repeated** fields (STRUCT / ARRAY) instead of large joins",
        ],
      ],
      [
        "Materialized views & BI",
        [
          "**Materialized views**: incremental refresh, automatic query rewrite",
          "**BI Engine**: in-memory acceleration for dashboards",
          "**Search indexes** for needle-in-haystack lookups",
        ],
      ],
      [
        "Fine-grained security",
        [
          "**Authorized views / datasets / routines** share results, not base tables",
          "**Row-level security** (row access policies)",
          "**Policy tags** for column-level security + **dynamic data masking**",
        ],
      ],
      [
        "Recovery & storage cost",
        [
          "**Time travel** 2–7 days + **fail-safe** 7 days",
          "**Table snapshots** and **clones**",
          "**Cross-region replication**; **managed DR** in Enterprise Plus",
          "**Long-term** price after 90 days unmodified; logical vs **physical** billing",
        ],
      ],
    ],
  ],
  [
    "lakehouse",
    "BigLake / Lakehouse",
    "store",
    ["3.1", "3.3", "3.4"],
    [
      "**BigLake** was renamed **Google Cloud Lakehouse** (Apr 2026); the exam guide still says BigLake",
      "Query open formats (**Parquet, ORC, Iceberg**) in Cloud Storage with BigQuery-grade governance",
      "Use when: open lakehouse, multiple engines (Spark + BigQuery), no data copies",
    ],
    [
      [
        "BigLake vs external tables",
        [
          "BigLake tables use a **connection** service account → users need no bucket access (**access delegation**)",
          "Support **row / column security** and masking; plain external tables do not",
          "**Metadata caching** speeds queries",
        ],
      ],
      [
        "Iceberg tables",
        [
          "**BigQuery tables for Apache Iceberg**: managed, DML, data in your bucket",
          "Shared **BigQuery metastore / universal catalog** for Spark and BigQuery",
        ],
      ],
      [
        "Omni & object tables",
        [
          "**BigQuery Omni** queries data in AWS / Azure in place",
          "**Object tables** expose unstructured files (images, PDFs) to SQL and AI",
        ],
      ],
    ],
  ],
  [
    "bigtable",
    "Bigtable",
    "store",
    ["3.1"],
    [
      "Wide-column **NoSQL** with **single-digit ms** latency at huge scale; **HBase API**",
      "Throughput scales linearly with **nodes**; storage is separate",
      "Use when: time series, IoT, adtech, fintech — TB to PB of key-based access",
      "Avoid when: multi-row transactions, SQL joins, small data (≲ 1 TB)",
    ],
    [
      [
        "Row key design",
        [
          "Only the **row key** is indexed; rows sorted lexicographically",
          "Avoid **hotspotting**: no leading timestamps or sequential IDs",
          "**Field promotion**, **salting / hashing**, reversed timestamps",
          "Shape the key for the main **prefix scan**",
        ],
      ],
      [
        "Schema & transactions",
        [
          "Column families; **tall & narrow** tables for time series",
          "**Single-row atomicity** only",
          "**Garbage collection** by versions or age",
        ],
      ],
      [
        "Replication & app profiles",
        [
          "Replicated clusters are **eventually consistent**",
          "**Multi-cluster routing** → automatic failover; **single-cluster** → read-your-writes",
          "App profiles isolate batch from serving",
        ],
      ],
      [
        "Performance & cost",
        [
          "**Key Visualizer** finds hotspots",
          "**SSD** by default; **HDD** only for large, cold, batch data",
          "**Autoscaling** on CPU / storage targets; **Data Boost** for analytics without hurting serving",
        ],
      ],
    ],
  ],
  [
    "spanner",
    "Spanner",
    "store",
    ["1.2", "3.1"],
    [
      "Globally distributed **relational** DB with **strong consistency** and horizontal scale",
      "Up to **99.999%** availability in multi-region configs",
      "Use when: global OLTP, beyond Cloud SQL limits, high write scale with ACID",
      "Avoid when: small regional apps (→ Cloud SQL / AlloyDB) or analytics (→ BigQuery)",
    ],
    [
      [
        "Schema design",
        [
          "Avoid **monotonically increasing keys** → use **UUIDv4** or **bit-reversed sequences**",
          "**Interleaved tables** co-locate parent and child rows",
          "**Secondary indexes** with STORING",
        ],
      ],
      [
        "Consistency",
        [
          "**External consistency** via **TrueTime**",
          "**Stale reads** (bounded / exact) cut latency",
          "Read-only transactions take no locks",
        ],
      ],
      [
        "Capacity & editions",
        [
          "**Processing units**: 1,000 PU = 1 node; autoscaling",
          "**Standard / Enterprise / Enterprise Plus** editions",
          "Regional vs **multi-region** instance configs",
        ],
      ],
      [
        "Data movement & recovery",
        [
          "**Change streams** → Dataflow / BigQuery",
          "**Data Boost** for BigQuery federation without load on the instance",
          "**PITR** up to **7 days**; backups and exports",
        ],
      ],
    ],
  ],
  [
    "cloudsql",
    "Cloud SQL",
    "store",
    ["3.1", "5.5"],
    [
      "Managed **MySQL, PostgreSQL, SQL Server**; scales vertically, single primary",
      "Storage up to **64 TB**",
      "Use when: regional OLTP, lift-and-shift relational apps",
      "Avoid when: global or horizontal write scale (→ **Spanner**) or analytics (→ BigQuery)",
    ],
    [
      [
        "High availability",
        [
          "**Regional HA**: synchronous standby in another zone with automatic failover",
          "**Enterprise Plus**: **99.99%** SLA, near-zero-downtime maintenance",
          "HA standby does **not** serve reads",
        ],
      ],
      [
        "Replicas & DR",
        [
          "**Read replicas** (async) for read scaling",
          "**Cross-region replica** → promote for DR",
          "Automated backups + **PITR** from logs",
        ],
      ],
      [
        "Access & security",
        [
          "**Private IP**; **Auth Proxy / connectors** with IAM",
          "**IAM database authentication**; CMEK",
          "BigQuery **EXTERNAL_QUERY** federation",
        ],
      ],
    ],
  ],
  [
    "alloydb",
    "AlloyDB",
    "store",
    ["3.1"],
    [
      "**PostgreSQL-compatible**, high-performance; compute and storage separated",
      "Built-in **columnar engine** speeds analytics on live data (**HTAP**)",
      "Use when: demanding PostgreSQL OLTP plus real-time analytics or vector search",
      "Avoid when: MySQL / SQL Server (→ Cloud SQL) or global writes (→ Spanner)",
    ],
    [
      [
        "Architecture",
        [
          "HA primary (active + standby) plus **read pool** instances",
          "Regional distributed storage; fast failover",
        ],
      ],
      [
        "DR & backups",
        ["**Cross-region secondary clusters** for DR", "Continuous backup with **PITR**"],
      ],
      [
        "AlloyDB AI",
        ["**pgvector** with **ScaNN** indexes for vector search", "Generate embeddings from SQL"],
      ],
    ],
  ],
  [
    "firestore",
    "Firestore",
    "store",
    ["3.1"],
    [
      "Serverless **document** database; strong consistency, **ACID transactions**",
      "**Real-time listeners** and offline sync for mobile / web",
      "Use when: app back ends, user profiles, catalogs with flexible schema",
      "Avoid when: analytics or large scans (→ BigQuery), heavy relational joins",
    ],
    [
      [
        "Modes",
        [
          "**Native mode** (real-time, mobile SDKs) vs **Datastore mode** (server apps)",
          "**MongoDB compatibility** option",
        ],
      ],
      [
        "Indexes & limits",
        [
          "Single-field indexes automatic; **composite indexes** for multi-field queries",
          "About **1 sustained write/s per document**; ramp traffic with the **500/50/5** rule",
          "Avoid indexing monotonically increasing fields",
        ],
      ],
      [
        "Export & recovery",
        ["Managed export to GCS → load to BigQuery", "**PITR** and scheduled backups"],
      ],
    ],
  ],
  [
    "memorystore",
    "Memorystore",
    "store",
    ["3.1", "5.5"],
    [
      "Managed in-memory **Redis**, **Valkey**, **Memcached** with **sub-ms** latency",
      "Use when: caching, sessions, leaderboards, rate limits",
      "Avoid when: you need a durable system of record",
    ],
    [
      [
        "HA options",
        [
          "Redis **Basic** (no replica) vs **Standard** (replica + automatic failover)",
          "**Cluster** mode: sharding with zonal replicas",
        ],
      ],
      [
        "Patterns",
        [
          "**Cache-aside** in front of Cloud SQL / Spanner / BigQuery results",
          "Persistence optional — plan for **cache loss**",
        ],
      ],
    ],
  ],
  [
    "bqml",
    "BigQuery ML",
    "analyze",
    ["4.2"],
    [
      "Train and predict with **SQL** in BigQuery (**CREATE MODEL**); no data movement",
      "Use when: analysts, tabular data already in BigQuery",
      "Avoid when: custom deep learning or specialized online serving (→ **Vertex AI**)",
    ],
    [
      [
        "Model types",
        [
          "**Linear / logistic regression**, **boosted trees**, **DNN**, **k-means**, **matrix factorization**",
          "**ARIMA_PLUS** for forecasting",
          "**Remote models** call Gemini or Vertex endpoints; import TensorFlow / ONNX",
        ],
      ],
      [
        "Model lifecycle",
        [
          "**ML.EVALUATE**, **ML.PREDICT**, **ML.EXPLAIN_PREDICT**",
          "**TRANSFORM** clause bakes preprocessing into the model → no training-serving skew",
          "Register in **Vertex AI Model Registry** for online serving",
        ],
      ],
      [
        "Feature engineering",
        [
          "**ML.BUCKETIZE**, **ML.FEATURE_CROSS**, **ML.STANDARD_SCALER**…",
          "**DATA_SPLIT** options for train / eval",
          "**AUTO_CLASS_WEIGHTS** for imbalanced classes",
        ],
      ],
      [
        "Embeddings & RAG",
        [
          "**ML.GENERATE_EMBEDDING** and Gemini text generation from SQL",
          "**VECTOR_SEARCH** with **vector indexes** for retrieval",
          "Chunk unstructured files exposed as **object tables**",
        ],
      ],
    ],
  ],
  [
    "vertex",
    "Vertex AI",
    "analyze",
    ["4.2"],
    [
      "Now **Gemini Enterprise Agent Platform** (Apr 2026, formerly Vertex AI)",
      "End-to-end ML: **AutoML**, custom training, **Model Registry**, endpoints, pipelines, Gemini & Model Garden",
      "Use when: custom models, MLOps, online serving, RAG and agents",
      "Avoid when: simple models on BigQuery data (→ **BigQuery ML**)",
    ],
    [
      [
        "Training",
        [
          "**AutoML** (no code) vs **custom training** (containers, GPUs / TPUs)",
          "**Hyperparameter tuning**; Workbench notebooks",
        ],
      ],
      [
        "Serving",
        [
          "**Online prediction** endpoints (low latency, autoscaling) vs **batch prediction**",
          "**Traffic split** for canary / A-B",
        ],
      ],
      [
        "MLOps",
        [
          "**Pipelines** (Kubeflow / TFX) for repeatable training",
          "**Feature Store** (BigQuery-backed) avoids training-serving skew",
          "**Model Monitoring**: skew and drift",
        ],
      ],
      [
        "RAG data prep",
        [
          "Clean → **chunk** → embed → index (**Vector Search** or BigQuery / AlloyDB vectors)",
          "Keep metadata for filtering; refresh embeddings when sources change",
          "**RAG Engine** / Agent Search ground Gemini on enterprise data",
        ],
      ],
    ],
  ],
  [
    "looker",
    "Looker",
    "analyze",
    ["4.1", "4.3"],
    [
      "Enterprise BI with a **LookML** semantic layer (governed metrics)",
      "Queries the warehouse live (e.g. BigQuery); nothing is extracted",
      "Use when: governed, reusable metrics and embedded analytics; **Looker Studio** (now **Data Studio**) for quick free dashboards",
    ],
    [
      [
        "LookML",
        [
          "Views, explores, models versioned in **Git**",
          "Single definition of each metric",
          "**PDTs** precompute heavy derived tables",
        ],
      ],
      [
        "Performance",
        [
          "**Caching** with datagroups; aggregate awareness",
          "Pair with **BI Engine** and **materialized views**",
          "Precalculate fields upstream (Dataform) for slow dashboards",
        ],
      ],
      [
        "Security",
        [
          "Row-level via **access filters / user attributes**",
          "Service account vs **OAuth** (per-user BigQuery permissions)",
        ],
      ],
    ],
  ],
  [
    "sharing",
    "BigQuery sharing",
    "analyze",
    ["4.3"],
    [
      "**BigQuery sharing** (formerly **Analytics Hub**): publish datasets through **exchanges** and **listings**",
      "Subscribers get a **linked dataset**: zero-copy, read-only, always current",
      "Use when: sharing across projects or organizations without exports",
    ],
    [
      [
        "Controls",
        [
          "**Egress controls** block copy / export",
          "**Data clean rooms** with aggregation thresholds for privacy-safe joins",
          "Subscribers pay their own query costs",
        ],
      ],
      [
        "Other ways to share",
        [
          "Inside the org: dataset **IAM** or **authorized views**",
          "Public datasets and Marketplace listings",
          "Reports: share Looker / Data Studio dashboards with viewer roles",
        ],
      ],
    ],
  ],
  [
    "iam",
    "IAM",
    "govern",
    ["1.1", "4.1"],
    [
      "Who (**principal**) can do what (**role**) on which **resource**; org → folder → project → resource",
      "Predefined roles to **groups**; **least privilege**; policies inherit downward",
      "**Deny policies** override allows",
    ],
    [
      [
        "BigQuery roles",
        [
          "**dataViewer / dataEditor / dataOwner** on datasets",
          "**jobUser** to run jobs in a project; **user** can also create datasets",
          "Querying needs **jobUser** in the billing project + **dataViewer** on the data",
        ],
      ],
      [
        "Service accounts",
        [
          "One service account per workload (Dataflow workers, Composer)",
          "Avoid **keys** → attached SAs or **Workload Identity Federation**",
          "**Impersonation** for short-lived credentials",
        ],
      ],
      [
        "Org policies & conditions",
        [
          "**Resource location** constraint for sovereignty",
          "Restrict public IPs, **domain-restricted sharing**, require CMEK",
          "**IAM Conditions** (time, resource name)",
        ],
      ],
      [
        "Environments",
        [
          "Separate **projects** for dev / test / prod",
          "Folders per business unit; **Shared VPC** host project",
        ],
      ],
    ],
  ],
  [
    "vpcsc",
    "VPC Service Controls",
    "govern",
    ["1.1"],
    [
      "**Service perimeters** stop **data exfiltration** through Google APIs (BigQuery, GCS…)",
      "Complements IAM: IAM says **who**; VPC SC limits **from where and to where**",
      "Use when: regulated data must not be copied to outside projects",
    ],
    [
      [
        "Perimeter design",
        [
          "**Access levels** (IP, device, identity) via Access Context Manager",
          "**Ingress / egress rules** for controlled cross-perimeter access",
          "**Perimeter bridges** between perimeters",
        ],
      ],
      [
        "Rollout",
        [
          "**Dry-run mode** logs violations before enforcing",
          "Pitfall: CI/CD or tools outside the perimeter break if not allowed",
        ],
      ],
      [
        "Private access",
        [
          "**Private Google Access** for VMs without public IPs",
          "**Private Service Connect** endpoints for Google APIs",
        ],
      ],
    ],
  ],
  [
    "kms",
    "Cloud KMS / CMEK",
    "govern",
    ["1.1", "2.1"],
    [
      "Everything is **encrypted at rest by default** with Google-managed keys",
      "**CMEK**: you control keys in **Cloud KMS** (rotate, disable, destroy)",
      "Use when: compliance demands key control or revocation",
    ],
    [
      [
        "Key options",
        [
          "Google-managed → **CMEK** (software / **Cloud HSM**) → **Cloud EKM** (external)",
          "**CSEK** only for Cloud Storage and Compute Engine",
          "**Autokey** automates CMEK creation",
        ],
      ],
      [
        "Operations",
        [
          "Key **location must match** the resource location",
          "Grant the service agent **cryptoKeyEncrypterDecrypter**",
          "Disabling or destroying a key makes data unreadable (**crypto-shredding**)",
        ],
      ],
      [
        "In BigQuery",
        [
          "Default CMEK per dataset; per-table keys",
          "**AEAD** SQL functions for column-level encryption",
        ],
      ],
    ],
  ],
  [
    "sdp",
    "Sensitive Data Protection",
    "govern",
    ["1.1", "4.1"],
    [
      "Formerly **Cloud DLP**: discover, classify and **de-identify** sensitive data",
      "Built-in **infoTypes** plus custom detectors",
      "Use when: PII in BigQuery / GCS / streams must be masked before analysis",
    ],
    [
      [
        "Discovery & inspection",
        [
          "**Discovery** profiles BigQuery, GCS, Cloud SQL continuously",
          "**Inspection jobs** on demand; findings to BigQuery / SCC",
        ],
      ],
      [
        "De-identification",
        [
          "**Masking**, **redaction**, **bucketing**, **date shifting**",
          "**Deterministic encryption / FPE** → reversible tokens with the key",
          "**Crypto hash** → irreversible but joinable",
          "Apply in **Dataflow** before data lands",
        ],
      ],
      ["Risk analysis", ["**k-anonymity**, **l-diversity**, k-map re-identification risk"]],
    ],
  ],
  [
    "dataplex",
    "Dataplex",
    "govern",
    ["1.3", "3.3", "3.4"],
    [
      "Now **Knowledge Catalog** (Apr 2026, formerly Dataplex Universal Catalog); the exam guide says **Dataplex**",
      "One place for **catalog**, **data quality**, **profiling**, **lineage** and governance",
      "Legacy **Data Catalog** began a phased shutdown in **June 2026** → migrate",
    ],
    [
      [
        "Catalog & search",
        [
          "Harvests metadata from BigQuery, Spanner, Cloud SQL, Pub/Sub…",
          "**Aspects** (metadata templates) and **business glossary**",
          "Self-service search for data consumers",
        ],
      ],
      [
        "Quality & profiling",
        [
          "**Data quality scans**: null, range, regex, SQL rules",
          "**Profiling scans**: statistics and distributions",
          "Alert on failed scans",
        ],
      ],
      [
        "Lineage",
        [
          "Automatic **lineage** for BigQuery, Composer, Dataproc, Data Fusion",
          "Impact analysis before schema changes",
        ],
      ],
      [
        "Data mesh",
        [
          "**Lakes / zones / assets** organize data by domain",
          "**Federated governance**: domains own data, central policies",
        ],
      ],
    ],
  ],
  [
    "monitoring",
    "Monitoring & Logging",
    "operate",
    ["5.4", "5.5"],
    [
      "**Cloud Monitoring** (metrics, dashboards, alerts) + **Cloud Logging** (logs, sinks)",
      "Track pipeline SLOs: freshness, lag, errors, cost",
    ],
    [
      [
        "Key pipeline metrics",
        [
          "Pub/Sub: **oldest unacked message age**, backlog",
          "Dataflow: **system lag**, **data freshness**",
          "BigQuery slot use & job errors; Composer DAG failures",
        ],
      ],
      [
        "Audit logs & sinks",
        [
          "**Admin Activity** logs: always on",
          "**Data Access** logs: off by default except BigQuery",
          "**Sinks** → BigQuery (analysis), GCS (retention), Pub/Sub (SIEM)",
        ],
      ],
      [
        "BigQuery admin",
        [
          "**INFORMATION_SCHEMA.JOBS** for cost per user / query",
          "**Admin resource charts** and slot estimator",
          "**Custom quotas** on bytes per day per user / project",
        ],
      ],
      [
        "Billing & quotas",
        [
          "**Budgets & alerts**; billing export to BigQuery",
          "Quota errors → request increase or throttle / batch",
          "Log-based metrics and **Error Reporting**",
        ],
      ],
    ],
  ],
  [
    "cicd",
    "CI/CD & IaC",
    "operate",
    ["2.3", "5.2"],
    ["Automate pipeline and infrastructure deployment across **dev → test → prod**"],
    [
      [
        "Tooling",
        [
          "**Terraform** / Infrastructure Manager for infrastructure",
          "**Cloud Build** + **Artifact Registry** to build, test, deploy",
          "Git for **Dataform** repos and Composer DAGs",
        ],
      ],
      [
        "Testing & release",
        [
          "Unit-test Beam transforms with **TestPipeline**",
          "Assertions and validation before promotion",
          "Ship Dataflow as **Flex Templates**; replace via **update** or drain-and-relaunch",
        ],
      ],
    ],
  ],
  [
    "networking",
    "Networking",
    "operate",
    ["1.4", "2.1"],
    ["Exam focus: private connectivity, hybrid links, egress cost"],
    [
      [
        "Hybrid links",
        [
          "**Cloud VPN**: encrypted over the internet, lower bandwidth",
          "**Dedicated / Partner Interconnect**: high bandwidth, low latency, SLA",
        ],
      ],
      [
        "Private access",
        [
          "**Private Google Access**, **Private Service Connect**",
          "**Shared VPC** centralizes network control",
        ],
      ],
      [
        "Cost & placement",
        [
          "Co-locate compute and data in one region to avoid **egress**",
          "Cross-region copies add cost and latency",
        ],
      ],
    ],
  ],
];
