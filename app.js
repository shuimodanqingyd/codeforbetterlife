(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Loader
  ------------------------------------------------------------------ */
  const loader = $("#loader");
  let loaderTimer;

  const hideLoader = () => {
    window.clearTimeout(loaderTimer);
    window.setTimeout(() => loader && loader.classList.add("is-done"), 480);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }
  // Never leave the interface behind a slow asset.
  loaderTimer = window.setTimeout(hideLoader, 3200);

  /* ------------------------------------------------------------------
     Header / navigation
  ------------------------------------------------------------------ */
  const header = $("#site-header");
  const menuToggle = $("#menu-toggle");
  const navLinks = $("#nav-links");
  const body = document.body;

  const setHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  setHeader();
  window.addEventListener("scroll", setHeader, { passive: true });

  const closeMenu = () => {
    body.classList.remove("nav-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "打开菜单");
    }
  };

  const openMenu = () => {
    body.classList.add("nav-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "关闭菜单");
    }
    const firstLink = $(".nav-links > a");
    if (firstLink) {
      window.setTimeout(() => {
        if (body.classList.contains("nav-open")) firstLink.focus({ preventScroll: true });
      }, 220);
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (body.classList.contains("nav-open")) closeMenu();
      else openMenu();
    });
  }

  $$("a", navLinks).forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("nav-open")) {
      closeMenu();
      menuToggle && menuToggle.focus();
      return;
    }

    if (event.key !== "Tab" || !body.classList.contains("nav-open")) return;
    const focusable = [...$$("a", navLinks), menuToggle].filter(Boolean);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });

  const navAnchors = $$(".nav-links > a");
  const resetNavAtTop = () => {
    if (window.scrollY > 140) return;
    navAnchors.forEach((a) => {
      a.classList.remove("is-active");
      a.removeAttribute("aria-current");
    });
  };
  window.addEventListener("scroll", resetNavAtTop, { passive: true });
  window.addEventListener("load", resetNavAtTop, { once: true });
  window.setTimeout(resetNavAtTop, 700);
  resetNavAtTop();
  const navSections = navAnchors
    .map((anchor) => {
      const id = anchor.getAttribute("href");
      return id && id.length > 1 ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && navSections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navAnchors.forEach((a) => {
            const active = a.getAttribute("href") === `#${entry.target.id}`;
            a.classList.toggle("is-active", active);
            if (active) a.setAttribute("aria-current", "page");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-38% 0px -54% 0px", threshold: 0 }
    );
    navSections.forEach((section) => navObserver.observe(section));
  }

  /* ------------------------------------------------------------------
     Clock — Asia/Shanghai
  ------------------------------------------------------------------ */
  const clock = $("#clock");
  const clockFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const updateClock = () => {
    if (clock) clock.textContent = clockFormatter.format(new Date());
  };
  updateClock();
  window.setInterval(updateClock, 1000);

  /* ------------------------------------------------------------------
     Reveal on scroll
  ------------------------------------------------------------------ */
  const revealElements = $$(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------
     Number counters
  ------------------------------------------------------------------ */
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const runCounter = (el) => {
    if (el.dataset.counted === "true") return;
    el.dataset.counted = "true";
    const target = Number(el.dataset.counter || 0);
    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }
    const duration = 1500;
    const start = performance.now();

    // Guarantee the final value even if rAF is throttled in a background tab.
    window.setTimeout(() => {
      el.textContent = String(target);
    }, duration + 250);

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = String(Math.round(target * easeOutQuart(progress)));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    requestAnimationFrame(step);
  };

  const counters = $$("[data-counter]");
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.55 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* ------------------------------------------------------------------
     Project archive
  ------------------------------------------------------------------ */
  const projects = {
    cvm: {
      id: "01",
      category: "data",
      categoryLabel: "数据工程 / DATA",
      year: "2020",
      title: "CVM 标签中台",
      summary:
        "把高频使用的标签沉淀到中间业务层，统一口径、自动化刷新，让标签从重复开发变成可复用的业务资产。",
      metrics: ["200+ 策略支撑", "12 万张发卡 KPI", "100% 目标达成"],
      context:
        "CVM 系统早期标签体系管理不够规范，公共标签重复开发、口径杂糅，既影响开发效率，也让数据一致性难以保证。目标是把共性标签加工到中间业务层，统一管理和复用。",
      work: [
        "按不同业务主题划分标签域，使用 SQL、Python 开发中间层标签。",
        "建立一致性验证环节，确保标签上线前具备业务可用性。",
        "通过 Moia / XXL 调度实现周期化自动跑批刷新。",
        "使用数据漏斗等方法定位缺失、异常值问题并完成修复。",
      ],
      outcome: [
        "中间业务层持续支撑 200+ 业务需求和策略。",
        "电销信用卡发卡 12 万张 KPI 100% 达成。",
      ],
      stack: ["SQL", "Python", "Linux", "Moia / XXL"],
    },
    credit: {
      id: "02",
      category: "data",
      categoryLabel: "数据工程 / DATA",
      year: "2020 — 2021",
      title: "信贷数仓回迁",
      summary:
        "新旧信贷系统切换中的数据字典映射、Oracle 代码改造与 Python + Trino 跨源验证。",
      metrics: ["故障率 < 2%", "逻辑一致性 99%+", "业务一致性 100%"],
      context:
        "信用卡中心推进核心系统自研化，数据需要从外部厂商信贷系统迁移至自有系统。CVM 系统的标签与数据链路也要同步改造，并与新系统保持口径一致。",
      work: [
        "梳理新旧数据字典映射，完成口径映射和版本管理。",
        "按映射关系改造 Oracle 代码，重建新版数据链路。",
        "使用 Python + Trino 做新旧数据验证，定位差异并修正。",
        "更新元数据信息，确保数据字典能够持续指导开发。",
      ],
      outcome: [
        "新信贷回迁改造项目顺利投产，稳定运行，故障率小于 2%。",
        "数据验证逻辑一致性超过 99%，业务一致性 100%。",
      ],
      stack: ["Oracle", "Python", "Linux", "Trino", "Moia / XXL"],
    },
    hadoop: {
      id: "03",
      category: "data",
      categoryLabel: "数据工程 / DATA",
      year: "2022 — 2023",
      title: "Oracle → Hadoop 迁移",
      summary:
        "面对 Oracle 跑批性能瓶颈，将 CVM 数据架构迁移到 Hadoop / Hive，重建分层、脚本与验证体系。",
      metrics: ["100 张表", "5000+ 字段", "20+ Hive 脚本"],
      context:
        "CVM 系统原先使用 Oracle 开发。随着业务量增长，传统数据库性能无法满足大数据量跑批要求，需要迁移至 Hadoop 分布式集群，用 Hive 获得更健壮的跑批性能。",
      work: [
        "梳理 100+ 张表、5000+ 字段的数据字典映射。",
        "完成 20+ 个 Oracle 脚本的分析与 Hive 开发。",
        "测试和调研 Spark、MapReduce 引擎的适用性。",
        "用 Python + Trino 完成新旧数据验证，并规范数据层级。",
        "遵循数据治理规范填报新增及变更元数据。",
      ],
      outcome: [
        "跑批效率提升，延迟率和故障率大幅降低，系统稳定性提高。",
        "数据验证逻辑一致性超过 99%，业务一致性 100%。",
      ],
      stack: ["Oracle", "Hive", "Hadoop", "Spark", "Python", "Trino"],
    },
    realtime: {
      id: "04",
      category: "realtime",
      categoryLabel: "实时计算 / REALTIME",
      year: "2023",
      title: "实时权益查询链路",
      summary:
        "Flink 读取 Kafka 报文，map 转换后 sink 到 Redis，构建实时权益查询；SpringBoot 打通 Hive 到 MySQL 的 API。",
      metrics: ["上线故障率 0%", "查询效率 +10%", "上线及时率 100%"],
      context:
        "新营销管理系统需要补齐实时权益查询能力，并服务特定业务场景的 API 需求。业务活动复盘要更快的数据反馈，策略跑批也需要更实时的参数支持。",
      work: [
        "编写详细设计文档，明确开发流程、边界与时间进度。",
        "使用 Flink 读取 Kafka 报文，经过 map 转换后 sink 到 Redis。",
        "构建实时权益查询链路，实现低延迟数据查询。",
        "使用 SpringBoot + Hive + MySQL 实现数据同步 API。",
      ],
      outcome: [
        "项目需求上线及时率、准确率 100%，上线故障率 0%。",
        "业务数据查询和分析效率提升 10%，支持活动如期开展。",
      ],
      stack: ["Flink", "Kafka", "Redis", "Hive", "MySQL", "SpringBoot", "Docker"],
    },
    compliance: {
      id: "05",
      category: "risk",
      categoryLabel: "量化与风控 / RISK",
      year: "2025",
      title: "合规审计系统",
      summary:
        "以技术经理角色推动关联交易系统纳管、跨系统协同和监管报送链路落地。",
      metrics: ["2 大系统按时投产", "20+ 外围系统协同", "全链路打通"],
      context:
        "广州银行合规审计团队需要应对监管数据报送要求，建设关联交易管理系统等数据监控系统，对重点监管人员进行数据监控。项目涉及大量上下游系统和配置协同。",
      work: [
        "负责团队技术管理，分析需求的技术实施方案。",
        "拉通需要协助配合的上下游系统，推进跨团队协作。",
        "推动关联交易系统纳管，解决 XXL 调度、数据库和系统配置问题。",
        "为团队数据开发提供技术支持，协助定位和解决技术问题。",
      ],
      outcome: [
        "成功推动关联交易系统纳管，实现开发、测试、投产演练全链路打通。",
        "支持关联交易、名单系统两大项目按时投产，协调近 20 个外围系统。",
      ],
      stack: ["Python", "SQL", "Linux", "XXL"],
    },
    fund: {
      id: "06",
      category: "risk",
      categoryLabel: "量化与风控 / QUANT",
      year: "2026 — NOW",
      title: "基金报告自动化",
      summary:
        "基于 DGP 文档生成平台串联数据接口与数据因子，让基金报告从手工拼装走向自动化生成。",
      metrics: ["试点迁移成功", "报告自动生成", "收益率口径优化"],
      context:
        "广发证券基金报告需要定期输出，数据调控要求自动化、灵活化。项目需要接入外部供应商 DGP 平台，并基于业务需求重算基金指标、优化私募基金收益率底层逻辑。",
      work: [
        "基于 DGP 搭建报告模板，串联数据接口和数据因子。",
        "实现报告数据因子的灵活调控和报告的自动化生成。",
        "优化私募基金收益率底层计算逻辑，融合数据口径并补齐缺失数据。",
        "重新梳理和计算基金报告中同类与基准排名类指标。",
      ],
      outcome: [
        "推动基金报告迁移 DGP 平台试点成功，释放前端开发工作量。",
        "按期完成收益率计算指标口径优化，赋能下游分析工作。",
      ],
      stack: ["Python", "SQL", "DGP", "基金指标"],
    },
    automation: {
      id: "07",
      category: "product",
      categoryLabel: "数据产品 / PRODUCT",
      year: "2021",
      title: "生产计划参数自动化",
      summary:
        "从 0 到 1 设计参数调整工具，把原来一周的代码开发量压缩到一天，并打通数据入仓链路。",
      metrics: ["周期 1 周 → 1 天", "月均挽回 600 万", "100% 稳定运行"],
      context:
        "CVM 系统的导数计划参数和假期计划参数原先依靠手工维护，每次调整都要经历代码开发、排期和上线，难以适应业务对生产计划的灵活调整。",
      work: [
        "用流程图梳理执行过程，明确各环节功能并疏通链路。",
        "与测试、安全、运维团队沟通可行性和实施方案。",
        "使用 Python + Oracle 完成前后端与数据开发，打通操作和数据。",
        "采集参数表数据，经清洗转化后通过数据分发系统 FTP 入仓，供 CVM 调用。",
      ],
      outcome: [
        "持续支持四大业务线月均 2 次参数调整，使用期间 100% 稳定有效。",
        "调整周期从一周缩短至一天，业务评估月均可挽回 600 万放款规模损失。",
      ],
      stack: ["Python", "Tkinter", "Oracle", "Hive", "Linux", "XXL"],
    },
    factory: {
      id: "08",
      category: "product",
      categoryLabel: "数据产品 / PRODUCT",
      year: "2024 — 2025",
      title: "标签工厂 & 财务看板",
      summary:
        "打通标签工厂与新营管系统，让指标迭代从一周缩短到最快一天；同时稳定维护 60+ 数据集的财务看板。",
      metrics: ["标签迭代最快 1 天", "60+ 数据集", "¥1 亿新增余额收入"],
      context:
        "新营管系统功能逐步完善后，策略部署、策略数据分析和维护成为主要工作。业务需要更灵活、更高效的数据标签投放方式，标签工厂的接入成为关键。",
      work: [
        "设计广赢卡和 eppc 差异化定价项目的数据链路。",
        "分析定位策略数据问题，用 Python 和 Hive 完成数据修复。",
        "打通标签工厂与新营管系统的数据交互接口。",
        "负责标签配置 SQL 编写，并基于 DataWorks + FBI 维护财务看板。",
      ],
      outcome: [
        "2024 年广赢卡新增余额收入 1 亿元。",
        "标签工厂接入让指标迭代从至少一周缩短至最快一天。",
        "稳定维护超 60 个数据集日常跑批，修正 20 万量级摊销金额。",
      ],
      stack: ["SQL", "Python", "Hive", "DataWorks", "FBI"],
    },
  };

  const categoryColors = {
    data: "#67f5ff",
    realtime: "#c8ff4d",
    risk: "#ff6b8a",
    product: "#ffb86b",
  };

  const projectCards = $$(".project-card");
  const projectModal = $("#project-modal");
  const modalClose = $("#modal-close");
  let lastFocused = null;

  const openProject = (key, card) => {
    const project = projects[key];
    if (!project || !projectModal) return;

    lastFocused = card || document.activeElement;
    $("#modal-category").textContent = project.categoryLabel;
    $("#modal-year").textContent = project.year;
    $("#modal-id").textContent = project.id;
    $("#modal-title").textContent = project.title;
    $("#modal-summary").textContent = project.summary;

    const categoryEl = $("#modal-category");
    categoryEl.style.color = categoryColors[project.category] || "#67f5ff";

    const metrics = $("#modal-metrics");
    metrics.innerHTML = "";
    project.metrics.forEach((metric) => {
      const span = document.createElement("span");
      span.textContent = metric;
      metrics.appendChild(span);
    });

    $("#modal-context").textContent = project.context;

    const work = $("#modal-work");
    work.innerHTML = "";
    project.work.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      work.appendChild(li);
    });

    const outcome = $("#modal-outcome");
    outcome.innerHTML = "";
    project.outcome.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      outcome.appendChild(li);
    });

    const stack = $("#modal-stack");
    stack.innerHTML = "";
    project.stack.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      stack.appendChild(li);
    });

    if (typeof projectModal.showModal === "function") {
      projectModal.showModal();
    } else {
      projectModal.setAttribute("open", "");
    }
    document.body.style.overflow = "hidden";
  };

  const closeProject = () => {
    if (!projectModal) return;
    if (typeof projectModal.close === "function") projectModal.close();
    else projectModal.removeAttribute("open");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  projectCards.forEach((card) => {
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-controls", "project-modal");
    card.addEventListener("click", () => openProject(card.dataset.project, card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProject(card.dataset.project, card);
      }
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeProject);

  if (projectModal) {
    projectModal.addEventListener("click", (event) => {
      if (event.target === projectModal) closeProject();
    });
    projectModal.addEventListener("close", () => {
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    });
  }

  /* ------------------------------------------------------------------
     Project filters
  ------------------------------------------------------------------ */
  const filterButtons = $$(".filter");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((b) => {
        const active = b === button;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      projectCards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-filtered", !show);
        if (show) {
          card.classList.add("is-visible");
          card.classList.remove("is-entering");
          // Restart the entry animation for the newly visible group.
          void card.offsetWidth;
          card.classList.add("is-entering");
          window.setTimeout(() => card.classList.remove("is-entering"), 700);
        }
      });
    });
  });

  /* ------------------------------------------------------------------
     Quality scan demo
  ------------------------------------------------------------------ */
  const runScanButton = $("#run-scan");
  const scanButtonText = $("#scan-btn-text");
  const scanLog = $("#scan-log");
  const scanStatus = $("#scan-status");
  const qualityGauge = $("#quality-gauge");
  const qualityScore = $("#quality-score");

  const gaugeCircumference = 2 * Math.PI * 96;
  const scanChecks = {
    completeness: $("#check-completeness"),
    uniqueness: $("#check-uniqueness"),
    consistency: $("#check-consistency"),
    freshness: $("#check-freshness"),
  };

  let scanning = false;
  let scanRun = 0;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const appendLog = (text, type = "") => {
    if (!scanLog) return;
    const line = document.createElement("p");
    line.className = "log-line";
    const time = document.createElement("span");
    time.className = "log-time";
    time.textContent = `[${clockFormatter.format(new Date())}]`;
    line.appendChild(time);
    if (type) {
      const tag = document.createElement("span");
      tag.className = `log-${type}`;
      tag.textContent = text;
      line.appendChild(tag);
    } else {
      line.appendChild(document.createTextNode(text));
    }
    scanLog.appendChild(line);
    scanLog.scrollTop = scanLog.scrollHeight;
  };

  const resetScan = () => {
    if (!scanLog) return;
    scanLog.innerHTML = "";
    const command = document.createElement("p");
    command.className = "log-line";
    command.innerHTML = '<span class="log-prompt">root@lhp:~$</span> ./quality_scan --scope all';
    scanLog.appendChild(command);
    if (qualityGauge) qualityGauge.style.strokeDashoffset = String(gaugeCircumference);
    if (qualityScore) qualityScore.textContent = "--";
    Object.values(scanChecks).forEach((el) => {
      if (el) el.textContent = "--";
      if (el) el.closest(".check-row").classList.remove("is-good");
    });
    if (scanStatus) scanStatus.textContent = "RUNNING / 扫描中";
  };

  const finishScan = () => {
    const values = {
      completeness: "99.8",
      uniqueness: "100.0",
      consistency: "99.3",
      freshness: "98.7",
    };
    const score = 99.4;
    if (qualityScore) qualityScore.textContent = score.toFixed(1);
    if (qualityGauge) {
      qualityGauge.style.strokeDashoffset = String(gaugeCircumference * (1 - score / 100));
    }
    Object.entries(values).forEach(([key, value]) => {
      const el = scanChecks[key];
      if (!el) return;
      el.textContent = value;
      el.closest(".check-row").classList.add("is-good");
    });
    if (scanStatus) scanStatus.textContent = "COMPLETE / 0 CRITICAL";
    if (scanButtonText) scanButtonText.textContent = "RESCAN QUALITY";
  };

  const runScan = async () => {
    if (scanning || !runScanButton || !scanLog) return;
    scanning = true;
    scanRun += 1;
    const thisRun = scanRun;
    runScanButton.disabled = true;
    runScanButton.setAttribute("aria-busy", "true");
    if (scanButtonText) scanButtonText.textContent = "SCANNING...";
    resetScan();

    const steps = [
      ["sandbox profile loaded", "info", 260],
      ["load schema map ................ 100 tables / 5,000 fields", "muted", 380],
      ["profile null ratio ............... PASS", "ok", 360],
      ["check duplicate keys ............ PASS", "ok", 340],
      ["reconcile cross-source .......... 99.3%", "info", 430],
      ["monitor freshness ................ 98.7%", "info", 360],
      ["scanning outliers ................ 3 WATCH", "warn", 420],
      ["generate risk signals ............ 0 CRITICAL", "ok", 360],
      ["scan complete .................... index 99.4", "ok", 420],
    ];

    for (const [text, type, delay] of steps) {
      if (thisRun !== scanRun) return;
      await wait(delay);
      appendLog(text, type);
    }

    if (thisRun !== scanRun) return;
    finishScan();
    scanning = false;
    runScanButton.disabled = false;
    runScanButton.removeAttribute("aria-busy");
  };

  if (runScanButton) runScanButton.addEventListener("click", runScan);
  if (qualityGauge) qualityGauge.style.strokeDasharray = String(gaugeCircumference);

  /* ------------------------------------------------------------------
     Copy email + toast
  ------------------------------------------------------------------ */
  const copyButton = $("#copy-email");
  const toast = $("#toast");
  const email = "gdutlianghuaping@163.com";
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-show"), 2400);
  };

  const fallbackCopy = (text) => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(area);
    return copied;
  };

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      let copied = false;
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch (error) {
        copied = fallbackCopy(email);
      }
      showToast(copied ? "邮箱已复制 · EMAIL COPIED" : "复制失败，请手动选择邮箱");
    });
  }

  /* ------------------------------------------------------------------
     Canvas constellation
  ------------------------------------------------------------------ */
  const canvas = $("#bg-canvas");

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const mouse = { x: -9999, y: -9999 };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes = [];
    let frame = 0;
    let rafId = 0;

    const nodeCount = () => {
      if (window.innerWidth < 640) return 34;
      if (window.innerWidth < 1024) return 52;
      return 76;
    };

    const makeNodes = () => {
      nodes = Array.from({ length: nodeCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.17,
        vy: (Math.random() - 0.5) * 0.17,
        r: 0.55 + Math.random() * 1.25,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeNodes();
      if (reduceMotion) draw(0);
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      // Connection web.
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 132) {
            const alpha = (1 - dist / 132) * 0.14;
            ctx.strokeStyle = `rgba(103, 245, 255, ${alpha})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Mouse proximity.
        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 170) {
          const alpha = (1 - mdist / 170) * 0.3;
          ctx.strokeStyle = `rgba(200, 255, 77, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Nodes.
      nodes.forEach((node) => {
        const twinkle = 0.48 + Math.sin(time * 0.0011 + node.phase) * 0.2;
        ctx.fillStyle = `rgba(103, 245, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();

        if (node.r > 1.2) {
          ctx.strokeStyle = `rgba(103, 245, 255, ${twinkle * 0.35})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r + 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };

    const loop = (time) => {
      frame += 1;
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      });
      draw(time);
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener(
      "pointermove",
      (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
      },
      { passive: true }
    );
    window.addEventListener(
      "mouseleave",
      () => {
        mouse.x = -9999;
        mouse.y = -9999;
      },
      { passive: true }
    );

    resizeCanvas();
    if (!reduceMotion) rafId = requestAnimationFrame(loop);

    document.addEventListener("visibilitychange", () => {
      if (reduceMotion) return;
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(loop);
      }
    });
  }

  /* ------------------------------------------------------------------
     Small detail: keep footer year current
  ------------------------------------------------------------------ */
  const yearSpans = $$("[data-year]");
  yearSpans.forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
